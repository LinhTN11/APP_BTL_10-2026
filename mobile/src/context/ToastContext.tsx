import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'match';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onPress?: () => void;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global ref for calling toast without hook if needed
let globalShowToast: ((options: ToastOptions | string) => void) | null = null;

export const toast = {
  show: (options: ToastOptions | string) => globalShowToast?.(options),
  success: (message: string, title: string = 'Thành công', duration?: number) =>
    globalShowToast?.({ type: 'success', title, message, duration }),
  error: (message: string, title: string = 'Lỗi', duration?: number) =>
    globalShowToast?.({ type: 'error', title, message, duration }),
  info: (message: string, title: string = 'Thông báo', duration?: number) =>
    globalShowToast?.({ type: 'info', title, message, duration }),
  match: (message: string, title: string = "IT'S A MATCH!", onPress?: () => void) =>
    globalShowToast?.({ type: 'match', title, message, duration: 5000, onPress }),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (opts: ToastOptions | string) => {
      const options: ToastOptions =
        typeof opts === 'string' ? { message: opts, type: 'info' } : opts;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCurrentToast(options);

      // Entrance animation
      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration ?? (options.type === 'error' ? 4000 : 3200);
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [translateY, opacity, hideToast]
  );

  // Set global handler
  globalShowToast = showToast;

  const getIconColor = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'match':
        return '#FF4458';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const getBadgeSymbol = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      case 'match':
        return '♥';
      case 'info':
      default:
        return 'i';
    }
  };

  const type = currentToast?.type || 'info';
  const badgeColor = getIconColor(type);
  const badgeSymbol = getBadgeSymbol(type);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {currentToast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrapper,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.toastCard, { borderLeftColor: badgeColor }]}
            onPress={() => {
              if (currentToast.onPress) {
                currentToast.onPress();
              }
              hideToast();
            }}
          >
            {/* Type badge icon */}
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badgeSymbol}</Text>
            </View>

            {/* Content text */}
            <View style={styles.content}>
              {currentToast.title ? (
                <Text style={styles.title} numberOfLines={1}>
                  {currentToast.title}
                </Text>
              ) : null}
              <Text style={styles.message} numberOfLines={3}>
                {currentToast.message}
              </Text>
            </View>

            {/* Close button */}
            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: toast.show,
      hideToast: () => {},
    };
  }
  return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  toastCard: {
    width: width - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
