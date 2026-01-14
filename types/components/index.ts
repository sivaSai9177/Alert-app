// Component prop types
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface AuthComponentProps extends BaseComponentProps {
  isLoading?: boolean;
  error?: string | null;
}

// Add more component types as needed