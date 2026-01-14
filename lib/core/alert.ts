import { Alert, Platform } from "react-native";

export interface AlertOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function showAlert({ title, description, variant = "default" }: AlertOptions) {
  if (Platform.OS === "web") {
    // For web, we could use a simple browser alert or console log
    // Since toast was causing issues, let's use browser alert for now
    const message = description ? `${title}\n${description}` : title;
    alert(message);
  } else {
    // For mobile, use native Alert
    Alert.alert(
      title,
      description,
      [
        {
          text: "OK",
          style: variant === "destructive" ? "destructive" : "default",
        },
      ]
    );
  }
}

export function showSuccessAlert(title: string, description?: string) {
  showAlert({ title, description, variant: "success" });
}

export function showErrorAlert(title: string, description?: string) {
  showAlert({ title, description, variant: "destructive" });
}