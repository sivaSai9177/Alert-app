import type { SvgProps as DefaultSvgProps } from "react-native-svg";

declare module "react-native-svg" {
  interface SvgProps extends DefaultSvgProps {
    className?: string;
  }
}

declare module "better-auth/types" {
  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    role?: string;
    hospitalId?: string;
  }
}
