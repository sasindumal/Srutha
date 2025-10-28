import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme, Searchbar, Chip, Button, RadioButton } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type SortOrder = 'latest' | 'oldest' | 'views';
type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export const HomeScreen = ({ navigation }: any) => {
  const { channels, videos, isLoading, refreshAllChannels, loadVideos, markVideoAsWatched, markVideoAsUnwatched } = useChannel();
  const theme = useTheme();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showWatched, setShowWatched] = useState(false);
  
  // State for infinite scroll
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = async () => {
    setDisplayCount(20);
    await refreshAllChannels();
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = [...videos];

    // Filter out watched videos by default (unless showWatched is true)
    if (!showWatched) {
      filtered = filtered.filter((video) => !video.watched);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.channelName.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query)
      );
    }

    // Channel filter
    if (selectedChannels.length > 0) {
      filtered = filtered.filter((video) =>
        selectedChannels.includes(video.channelId)
      );
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((video) => {
        if (!video.uploadDate) return false;
        return new Date(video.uploadDate) >= filterDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'latest':
          return (
            new Date(b.uploadDate || 0).getTime() -
            new Date(a.uploadDate || 0).getTime()
          );
        case 'oldest':
          return (
            new Date(a.uploadDate || 0).getTime() -
            new Date(b.uploadDate || 0).getTime()
          );
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [videos, searchQuery, selectedChannels, sortOrder, timeFilter, showWatched]);

  // Paginated videos for infinite scroll
  const displayedVideos = filteredAndSortedVideos.slice(0, displayCount);

  const handleLoadMore = () => {
    if (displayCount < filteredAndSortedVideos.length && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayCount((prev) => prev + 20);
        setIsLoadingMore(false);
      }, 300);
    }
  };

  const handleToggleWatched = async (videoId: string, currentWatched?: boolean) => {
    try {
      if (currentWatched) {
        await markVideoAsUnwatched(videoId);
      } else {
        await markVideoAsWatched(videoId);
      }
      // Reload videos to reflect changes
      await loadVideos();
    } catch (error) {
      console.error('Error toggling watched status:', error);
    }
  };

  const toggleChannelFilter = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const clearFilters = () => {
    setSelectedChannels([]);
    setTimeFilter('all');
    setSortOrder('latest');
    setSearchQuery('');
    setShowWatched(false);
  };

  const activeFilterCount = 
    selectedChannels.length + 
    (timeFilter !== 'all' ? 1 : 0) + 
    (sortOrder !== 'latest' ? 1 : 0) +
    (showWatched ? 1 : 0);

  const renderEmptyState = () => {
    if (channels.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="video-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No channels added yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your favorite YouTube channels
          </Text>
        </View>
      );
    }
    
    if (filteredAndSortedVideos.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="video-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No videos found' : 'No videos available'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try a different search' : 'Pull down to refresh'}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }
    if (displayCount >= filteredAndSortedVideos.length && filteredAndSortedVideos.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>No more videos</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search videos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
          iconColor="#AAAAAA"
          placeholderTextColor="#717171"
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsContainer}
        contentContainerStyle={styles.filterChipsContent}
      >
        <Chip
          icon="filter-variant"
          selected={activeFilterCount > 0}
          onPress={() => setShowFilterModal(true)}
          style={styles.filterChip}
        >
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </Chip>
        
        {selectedChannels.length > 0 && (
          <Chip
            selected
            onClose={() => setSelectedChannels([])}
            style={styles.filterChip}
          >
            {selectedChannels.length} Channel{selectedChannels.length > 1 ? 's' : ''}
          </Chip>
        )}

        {timeFilter !== 'all' && (
          <Chip
            selected
            onClose={() => setTimeFilter('all')}
            style={styles.filterChip}
          >
            {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
          </Chip>
  )}
        {sortOrder !== 'latest' && (
          <Chip
            selected
            onClose={() => setSortOrder('latest')}
            style={styles.filterChip}
          >
            {sortOrder === 'oldest' ? 'Oldest First' : 'Most Views'}
          </Chip>
        )}

        {showWatched && (
          <Chip
            selected
            onClose={() => setShowWatched(false)}
            style={styles.filterChip}
          >
            Showing Watched
          </Chip>
        )}
      </ScrollView>

      {/* Videos List */}
      <FlatList
        data={displayedVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => navigation.navigate('VideoPlayer', { video: item })}
            onToggleWatched={() => handleToggleWatched(item.id, item.watched)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={displayedVideos.length === 0 ? styles.emptyList : undefined}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Sort Order */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <RadioButton.Group
                onValueChange={(value) => setSortOrder(value as SortOrder)}
                value={sortOrder}
              >
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setSortOrder('latest')}
                >
                  <RadioButton value="latest" />
                  <Text style={styles.radioLabel}>Latest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setSortOrder('oldest')}
                >
                  <RadioButton value="oldest" />
                  <Text style={styles.radioLabel}>Oldest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setSortOrder('views')}
                >
                  <RadioButton value="views" />
                  <Text style={styles.radioLabel}>Most Views</Text>
                </TouchableOpacity>
              </RadioButton.Group>

              {/* Time Filter */}
              <Text style={styles.filterSectionTitle}>Upload Time</Text>
              <RadioButton.Group
                onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                value={timeFilter}
              >
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setTimeFilter('all')}
                >
                  <RadioButton value="all" />
                  <Text style={styles.radioLabel}>All Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setTimeFilter('today')}
                >
                  <RadioButton value="today" />
                  <Text style={styles.radioLabel}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setTimeFilter('week')}
                >
                  <RadioButton value="week" />
                  <Text style={styles.radioLabel}>This Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setTimeFilter('month')}
                >
                  <RadioButton value="month" />
                  <Text style={styles.radioLabel}>This Month</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setTimeFilter('year')}
                >
                  <RadioButton value="year" />
                  <Text style={styles.radioLabel}>This Year</Text>
                </TouchableOpacity>
              </RadioButton.Group>

              {/* Watched Videos Toggle */}
              <Text style={styles.filterSectionTitle}>Watched Videos</Text>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setShowWatched(!showWatched)}
              >
                <RadioButton
                  value="showWatched"
                  status={showWatched ? 'checked' : 'unchecked'}
                  onPress={() => setShowWatched(!showWatched)}
                />
                <Text style={styles.radioLabel}>Show Watched Videos</Text>
              </TouchableOpacity>

              {/* Channel Filter */}
              <Text style={styles.filterSectionTitle}>Channels</Text>
              {channels.map((channel) => (
                <TouchableOpacity
                  key={channel.id}
                  style={styles.channelFilterItem}
                  onPress={() => toggleChannelFilter(channel.id)}
                >
                  <RadioButton
                    value={channel.id}
                    status={selectedChannels.includes(channel.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleChannelFilter(channel.id)}
                  />
                  <Text style={styles.channelFilterLabel}>{channel.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.clearButton}
                textColor="#AAAAAA"
                buttonColor="transparent"
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilterModal(false)}
                style={styles.applyButton}
                buttonColor="#3EA6FF"
              >
                Apply
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#212121',
    borderRadius: 8,
  },
  filterChipsContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterChipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#272727',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#AAAAAA',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#717171',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#212121',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F3F',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1F1F1',
  },
  modalBody: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F1F1',
    marginTop: 16,
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    marginLeft: 8,
  },
  channelFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  channelFilterLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F3F',
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
