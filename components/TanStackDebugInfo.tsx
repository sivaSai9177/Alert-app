import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useQueryClient, useIsFetching, useIsMutating } from '@tanstack/react-query';
import { showSuccessAlert } from '@/lib/core/alert';
import * as Clipboard from 'expo-clipboard';

interface QueryInfo {
  queryKey: any[];
  state: {
    status: string;
    fetchStatus: string;
    dataUpdateCount: number;
    errorUpdateCount: number;
    data?: any;
    error?: any;
  };
}

export function TanStackDebugInfo() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());

  // Get all queries from the cache
  const queries = queryClient.getQueryCache().getAll();
  const mutations = queryClient.getMutationCache().getAll();

  // Group queries by their first key (usually the tRPC route)
  const groupedQueries = queries.reduce((acc, query) => {
    const key = Array.isArray(query.queryKey) ? query.queryKey[0] : 'unknown';
    const keyStr = typeof key === 'object' ? JSON.stringify(key) : String(key);
    
    if (!acc[keyStr]) {
      acc[keyStr] = [];
    }
    
    acc[keyStr].push({
      queryKey: [...query.queryKey],
      state: {
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        dataUpdateCount: query.state.dataUpdateCount,
        errorUpdateCount: query.state.errorUpdateCount,
        data: query.state.data,
        error: query.state.error,
      }
    });
    
    return acc;
  }, {} as Record<string, QueryInfo[]>);

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  const clearCache = () => {
    queryClient.clear();
  };

  const refetchAll = () => {
    queryClient.refetchQueries();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      showSuccessAlert('Copied!', `${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllQueries = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      summary: {
        activeFetches: isFetching,
        activeMutations: isMutating,
        totalQueries: queries.length,
        totalMutations: mutations.length,
      },
      queries: groupedQueries,
      mutations: mutations.map(m => ({
        key: m.options.mutationKey,
        status: m.state.status,
        error: m.state.error,
      })),
    };
    copyToClipboard(JSON.stringify(debugInfo, null, 2), 'Query Debug Info');
  };

  const copyQueryData = (query: QueryInfo) => {
    const data = {
      queryKey: query.queryKey,
      state: query.state,
      timestamp: new Date().toISOString(),
    };
    copyToClipboard(JSON.stringify(data, null, 2), 'Query Data');
  };

  const toggleQueryExpanded = (key: string) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedQueries(newExpanded);
  };

  const getQueryKeyDisplay = (queryKey: any[]): string => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return 'Unknown';
    
    // Handle tRPC query keys
    if (queryKey.length >= 2 && Array.isArray(queryKey[0])) {
      const [route, params] = queryKey;
      if (Array.isArray(route)) {
        return route.join('.') + (params?.input ? ` (${JSON.stringify(params.input)})` : '');
      }
    }
    
    // Fallback display
    return queryKey.map(k => typeof k === 'object' ? JSON.stringify(k) : String(k)).join('.');
  };

  return (
    <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          TanStack Query Status
        </Text>
        <TouchableOpacity
          onPress={copyAllQueries}
          style={{
            backgroundColor: '#6366f1',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11 }}>Copy All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Summary */}
      <View style={{ backgroundColor: '#f3f4f6', padding: 8, borderRadius: 6, marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: '#374151' }}>
          Active Fetches: {isFetching} | Active Mutations: {isMutating}
        </Text>
        <Text style={{ fontSize: 12, color: '#374151' }}>
          Total Queries: {queries.length} | Total Mutations: {mutations.length}
        </Text>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <TouchableOpacity
          onPress={invalidateAll}
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Invalidate All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={refetchAll}
          style={{
            backgroundColor: '#10b981',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Refetch All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearCache}
          style={{
            backgroundColor: '#ef4444',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Query Groups */}
      <ScrollView style={{ maxHeight: 300 }}>
        {Object.entries(groupedQueries).map(([groupKey, queries]) => (
          <View key={groupKey} style={{ marginBottom: 8 }}>
            <TouchableOpacity 
              onPress={() => toggleQueryExpanded(groupKey)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '600', 
                color: '#6366f1',
                marginBottom: 4,
              }}>
                {expandedQueries.has(groupKey) ? '▼' : '▶'} {groupKey} ({queries.length})
              </Text>
            </TouchableOpacity>
            
            {expandedQueries.has(groupKey) && queries.map((query, index) => {
              const queryKeyDisplay = getQueryKeyDisplay(query.queryKey);
              const isPending = query.state.status === 'pending';
              const isFetching = query.state.fetchStatus === 'fetching';
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => copyQueryData(query)}
                  activeOpacity={0.7}
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: 6, 
                    marginLeft: 12,
                    marginBottom: 4,
                    borderRadius: 4,
                    borderLeftWidth: 3,
                    borderLeftColor: 
                      query.state.status === 'error' ? '#ef4444' :
                      query.state.status === 'pending' ? '#f59e0b' :
                      query.state.status === 'success' ? '#10b981' : '#6b7280'
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#374151', flex: 1 }} numberOfLines={1}>
                      {queryKeyDisplay}
                    </Text>
                    <Text style={{ fontSize: 9, color: '#6b7280', marginLeft: 4 }}>
                      Tap to copy
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                    <Text style={{ fontSize: 10, color: '#374151' }}>
                      Status: {query.state.status}
                      {isFetching && ' (fetching)'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#6b7280' }}>
                      Updates: {query.state.dataUpdateCount}
                    </Text>
                  </View>
                  
                  {query.state.fetchStatus !== 'idle' && (
                    <Text style={{ fontSize: 10, color: '#f59e0b' }}>
                      Fetch Status: {query.state.fetchStatus}
                    </Text>
                  )}
                  
                  {/* Show data preview for debugging */}
                  {query.state.data && (
                    <Text style={{ fontSize: 9, color: '#10b981', marginTop: 2 }} numberOfLines={1}>
                      Data: {JSON.stringify(query.state.data).substring(0, 50)}...
                    </Text>
                  )}
                  
                  {query.state.error && (
                    <Text style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>
                      Error: {query.state.error.message || 'Unknown error'}
                    </Text>
                  )}
                  
                  {/* Special handling for checkEmailExists */}
                  {queryKeyDisplay.includes('checkEmailExists') && isPending && (
                    <Text style={{ fontSize: 9, color: '#f59e0b', marginTop: 2 }}>
                      ⚠️ Query stuck in pending - Check manual refetch trigger
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Active Mutations */}
      {mutations.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
            Active Mutations
          </Text>
          {mutations.map((mutation, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                const data = {
                  key: mutation.options.mutationKey,
                  status: mutation.state.status,
                  error: mutation.state.error,
                  timestamp: new Date().toISOString(),
                };
                copyToClipboard(JSON.stringify(data, null, 2), 'Mutation Data');
              }}
              activeOpacity={0.7}
              style={{ 
                backgroundColor: '#fee2e2', 
                padding: 6, 
                marginBottom: 4,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: '#dc2626' }}>
                {mutation.options.mutationKey?.join('.') || 'Anonymous'} - {mutation.state.status}
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>
                Tap to copy
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}