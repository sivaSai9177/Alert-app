/**
 * WebSocket Connection Manager
 * Manages WebSocket connections, user mappings, and heartbeat
 */

import type { WebSocket } from 'ws';
import { log } from '@/lib/core/logger';

export interface Connection {
  id: string;
  ws: WebSocket;
  userId?: string;
  role?: string;
  hospitalId?: string;
  isAlive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export class ConnectionManager {
  private connections = new Map<string, Connection>();
  private userConnections = new Map<string, Set<string>>();
  private hospitalConnections = new Map<string, Set<string>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  addConnection(connection: Connection) {
    this.connections.set(connection.id, connection);
    
    // Map user to connection
    if (connection.userId) {
      if (!this.userConnections.has(connection.userId)) {
        this.userConnections.set(connection.userId, new Set());
      }
      this.userConnections.get(connection.userId)!.add(connection.id);
    }
    
    // Map hospital to connection
    if (connection.hospitalId) {
      if (!this.hospitalConnections.has(connection.hospitalId)) {
        this.hospitalConnections.set(connection.hospitalId, new Set());
      }
      this.hospitalConnections.get(connection.hospitalId)!.add(connection.id);
    }
    
    log.info('WebSocket connection added', 'WS_MANAGER', {
      connectionId: connection.id,
      userId: connection.userId,
      hospitalId: connection.hospitalId,
      role: connection.role,
    });
  }

  removeConnection(id: string) {
    const connection = this.connections.get(id);
    if (!connection) return;

    this.connections.delete(id);
    
    // Remove from user connections
    if (connection.userId && this.userConnections.has(connection.userId)) {
      const userConnections = this.userConnections.get(connection.userId)!;
      userConnections.delete(id);
      if (userConnections.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }
    
    // Remove from hospital connections
    if (connection.hospitalId && this.hospitalConnections.has(connection.hospitalId)) {
      const hospitalConnections = this.hospitalConnections.get(connection.hospitalId)!;
      hospitalConnections.delete(id);
      if (hospitalConnections.size === 0) {
        this.hospitalConnections.delete(connection.hospitalId);
      }
    }
    
    log.info('WebSocket connection removed', 'WS_MANAGER', {
      connectionId: id,
      userId: connection.userId,
      hospitalId: connection.hospitalId,
    });
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  getConnectionsByUser(userId: string): Connection[] {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return [];
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter(Boolean) as Connection[];
  }

  getConnectionsByHospital(hospitalId: string): Connection[] {
    const connectionIds = this.hospitalConnections.get(hospitalId);
    if (!connectionIds) return [];
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter(Boolean) as Connection[];
  }

  getConnectionsByRole(role: string): Connection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.role === role);
  }

  updateConnectionActivity(id: string) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.lastActivity = new Date();
      connection.isAlive = true;
    }
  }

  broadcastToUser(userId: string, data: any) {
    const connections = this.getConnectionsByUser(userId);
    this.broadcast(connections, data);
  }

  broadcastToHospital(hospitalId: string, data: any) {
    const connections = this.getConnectionsByHospital(hospitalId);
    this.broadcast(connections, data);
  }

  broadcastToRole(role: string, hospitalId: string, data: any) {
    const connections = this.getConnectionsByHospital(hospitalId)
      .filter(conn => conn.role === role);
    this.broadcast(connections, data);
  }

  private broadcast(connections: Connection[], data: any) {
    const message = JSON.stringify(data);
    let successCount = 0;
    let failCount = 0;
    
    connections.forEach(conn => {
      if (conn.ws.readyState === 1) { // WebSocket.OPEN
        try {
          conn.ws.send(message);
          successCount++;
        } catch (error) {
          failCount++;
          log.error('Failed to send WebSocket message', 'WS_MANAGER', {
            connectionId: conn.id,
            error,
          });
        }
      } else {
        failCount++;
      }
    });
    
    if (failCount > 0) {
      log.warn('Some WebSocket broadcasts failed', 'WS_MANAGER', {
        total: connections.length,
        success: successCount,
        failed: failCount,
      });
    }
  }

  // Heartbeat to detect stale connections
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds
      
      this.connections.forEach((connection) => {
        if (!connection.isAlive) {
          // Connection failed to respond to ping
          connection.ws.terminate();
          this.removeConnection(connection.id);
          return;
        }
        
        // Check for inactive connections
        if (now - connection.lastActivity.getTime() > timeout * 2) {
          log.warn('Terminating inactive connection', 'WS_MANAGER', {
            connectionId: connection.id,
            lastActivity: connection.lastActivity,
          });
          connection.ws.terminate();
          this.removeConnection(connection.id);
          return;
        }
        
        // Send ping
        connection.isAlive = false;
        connection.ws.ping();
      });
      
      // Log connection stats
      log.debug('WebSocket heartbeat', 'WS_MANAGER', {
        totalConnections: this.connections.size,
        totalUsers: this.userConnections.size,
        totalHospitals: this.hospitalConnections.size,
      });
    }, 30000); // 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get connection statistics
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      totalUsers: this.userConnections.size,
      totalHospitals: this.hospitalConnections.size,
      connectionsByRole: {} as Record<string, number>,
      connectionsByHospital: {} as Record<string, number>,
    };
    
    // Count by role
    this.connections.forEach(conn => {
      if (conn.role) {
        stats.connectionsByRole[conn.role] = (stats.connectionsByRole[conn.role] || 0) + 1;
      }
    });
    
    // Count by hospital
    this.hospitalConnections.forEach((connections, hospitalId) => {
      stats.connectionsByHospital[hospitalId] = connections.size;
    });
    
    return stats;
  }

  // Clean up all connections
  closeAll() {
    this.stopHeartbeat();
    
    this.connections.forEach(connection => {
      connection.ws.close(1000, 'Server shutting down');
    });
    
    this.connections.clear();
    this.userConnections.clear();
    this.hospitalConnections.clear();
    
    log.info('All WebSocket connections closed', 'WS_MANAGER');
  }
}

export const connectionManager = new ConnectionManager();