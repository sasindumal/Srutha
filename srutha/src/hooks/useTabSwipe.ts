import { useMemo, useRef } from 'react';
import { PanResponder, PanResponderInstance, GestureResponderEvent, PanResponderGestureState, Dimensions } from 'react-native';

type NavLike = {
  getParent: () => any;
};

const EDGE_WIDTH = 24; // px from screen edges to start swipe
const SWIPE_THRESHOLD = 50; // required dx to trigger

export function useTabSwipe(navigation: NavLike, enabled: boolean = true) {
  const startXRef = useRef(0);

  const goToAdjacentTab = (direction: 'next' | 'prev') => {
    const parent = navigation?.getParent?.();
    if (!parent?.getState) return;
    const state = parent.getState();
    const routes = state?.routes ?? [];
    const index = state?.index ?? 0;
    if (!routes.length) return;

    let targetIndex = index;
    if (direction === 'next' && index < routes.length - 1) {
      targetIndex = index + 1;
    } else if (direction === 'prev' && index > 0) {
      targetIndex = index - 1;
    }
    if (targetIndex !== index) {
      parent.navigate(routes[targetIndex].name);
    }
  };

  const panResponder: PanResponderInstance | null = useMemo(() => {
    if (!enabled) return null;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const { dx, dy } = gestureState;
        // Horizontal intent and threshold
        const horizontal = Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 10;
        return enabled && horizontal;
      },
      onPanResponderGrant: (evt) => {
        startXRef.current = evt.nativeEvent.pageX;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;
        const startX = startXRef.current;
        // Only accept if gesture started near an edge to avoid conflicts with inner horizontal scrolls
        const screenWidth = Dimensions.get('window').width;
        const isFromEdge = startX <= EDGE_WIDTH || startX >= screenWidth - EDGE_WIDTH;
        // Fallback if window width isn't available: allow either edge
        const accept = isFromEdge || Math.abs(vx) > 0.75; // fast fling anywhere
        if (!accept) return;

        if (dx <= -SWIPE_THRESHOLD) {
          goToAdjacentTab('next');
        } else if (dx >= SWIPE_THRESHOLD) {
          goToAdjacentTab('prev');
        }
      },
    });
  }, [enabled]);

  return panResponder?.panHandlers ?? {};
}
