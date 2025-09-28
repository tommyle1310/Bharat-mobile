import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { theme } from "../theme";

interface HeaderProps {
  logo: any; // require("path/to/logo.png") hoặc { uri: string }
  height?: number; // Optional height prop for collapsible behavior
}

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 300;

const WavyHeader: React.FC<HeaderProps> = ({ logo, height = HEADER_HEIGHT }) => {
  // Calculate logo size based on header height
  const logoSize = Math.max(40, height * 0.47); // Minimum 40px, scales with height
  const logoPadding = Math.max(8, height * 0.03); // Minimum 8px padding
  
  return (
    <View style={styles.container}>
      {/* Nền đỏ + liquid shape */}
      <View style={[styles.background, { height }]}>
        <Svg
          height={height}
          width={width}
          viewBox={`0 0 ${width} ${height}`}
          style={styles.svg}
        >
          <Path
            d={`
              M0 0 
              H${width} 
              V${height - 40} 
              Q${width * 0.75} ${height} ${width / 2} ${
              height - 30
            } 
              Q${width * 0.25} ${height - 60} 0 ${height - 20} 
              Z
            `}
            fill={'#4e8541'}
          />
        </Svg>
      </View>

      {/* Logo chính giữa */}
      <View style={[styles.logoWrapper, { 
        marginTop: height * 0.17, // 17% from top
        padding: logoPadding,
        borderRadius: logoPadding * 2,
      }]}>
        <Image 
          source={logo} 
          style={[styles.logo, { width: logoSize, height: logoSize }]} 
          resizeMode="contain" 
        />
      </View>
    </View>
  );
};

export default WavyHeader;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  svg: {
    position: "absolute",
    top: 0,
  },
  logoWrapper: {
    backgroundColor: theme.colors.backgroundWithLogo,
    elevation: 4,
    ...theme.shadows.sm,
  },
  logo: {
    // Size will be set dynamically based on height prop
  },
});
