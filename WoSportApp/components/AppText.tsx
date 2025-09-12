import React from "react";
import { Text, TextProps } from "react-native";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <Text {...props} style={[{ fontFamily: "IowanOldStyle" }, style]}>
      {children}
    </Text>
  );
};
