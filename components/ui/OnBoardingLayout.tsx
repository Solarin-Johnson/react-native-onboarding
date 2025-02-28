import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  BackHandler,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, useFocusEffect } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigationState } from "@react-navigation/native";

type ValidPaths =
  | "/"
  | "/onboarding/step-1"
  | "/onboarding/step-2"
  | "/onboarding/step-3"
  | "/onboarding/welcome";
interface OnBoardingLayoutProps {
  children: React.ReactNode;
  bgColor?: string;
  nextBgColor?: string;
  nextTextColor?: string;
  nextText?: string;
  nextHref?: ValidPaths;
  complete?: boolean;
}

const SPRING_CONFIG = {
  mass: 0.75,
  damping: 12,
  stiffness: 120,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

export const OnBoardingLayout: React.FC<OnBoardingLayoutProps> = ({
  children,
  nextBgColor,
  bgColor,
  nextTextColor,
  nextText = "NEXT",
  nextHref,
  complete,
}) => {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const backgroundColor = bgColor ? bgColor : bg;
  const nexBgColor = nextBgColor ? nextBgColor : text + "90";
  const nextColor = nextTextColor ? nextTextColor : bg;
  const [goingBack, setGoingBack] = useState(false);
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);
  const screenStack = useNavigationState((state) => state.routes);
  const initial = screenStack.length === 1;

  const normalScale = useDerivedValue(() => {
    return Math.min(1, scale.value - 1);
  });

  const dynamic_duration = initial
    ? 0
    : goingBack
    ? Math.max(500, Math.max(width, 700))
    : Math.min(550, Math.max(width, 800));

  const TIMING_CONFIG_DYNAMIC = React.useMemo(
    () => ({
      duration: dynamic_duration,
    }),
    [dynamic_duration]
  );

  const TIMING_CONFIG = React.useMemo(
    () => ({
      duration: initial ? 0 : 600,
    }),
    [initial]
  );

  useEffect(() => {
    scale.value = Math.max(8, width / 80);
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(scale.value, TIMING_CONFIG_DYNAMIC) }],
  }));

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(normalScale.value, TIMING_CONFIG) }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: goingBack
          ? withTiming(
              initial ? 1 : Math.max(0, normalScale.value),
              TIMING_CONFIG
            )
          : withSpring(
              initial ? 1 : Math.max(0, normalScale.value),
              SPRING_CONFIG
            ),
      },
    ],
    opacity: goingBack
      ? withTiming(0)
      : withDelay(120, withTiming(normalScale.value, TIMING_CONFIG)),
  }));

  const handleBack = React.useCallback(() => {
    if (initial || complete) return true;
    if (goingBack) return true; // Prevent multiple back actions

    setGoingBack(true);
    scale.value = 1;

    setTimeout(() => {
      setGoingBack(false);
      router.back();
    }, TIMING_CONFIG.duration);

    return true;
  }, [initial, complete, goingBack, scale, TIMING_CONFIG.duration]);

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  });

  return (
    <Pressable style={{ flex: 1 }} onPress={handleBack}>
      <Animated.View style={[styles.container]}>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor,
            },
            animatedStyle,
          ]}
        />
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {children}
        </Animated.View>
        {nextHref && (
          <Animated.View
            style={[
              styles.next,
              {
                backgroundColor: nexBgColor,
                transform: [{ scale: 1 }],
              },
              btnAnimatedStyle,
            ]}
          >
            <Pressable
              onPress={() => router.push(nextHref)}
              style={styles.nextBtn}
            >
              <Text style={[styles.nextText, { color: nextColor }]}>
                {nextText}
              </Text>
              <FontAwesome6
                name="arrow-right"
                color={nextColor}
                size={18}
                style={{ paddingTop: 1 }}
              />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    transformOrigin: "140% 60%",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  next: {
    position: "absolute",
    bottom: -20,
    right: -45,
    width: 200,
    aspectRatio: 1,
    borderRadius: "50%",
    paddingBottom: 10,
    paddingRight: 10,
    transformOrigin: "bottom right",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    paddingRight: 6,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Roboto_700Bold",
  },
  overlay: {
    position: "absolute",
    bottom: -20,
    right: -45,
    width: 200,
    aspectRatio: 1,
    transformOrigin: "bottom right",
    borderRadius: "50%",
    borderBottomRightRadius: 0,
  },
});
