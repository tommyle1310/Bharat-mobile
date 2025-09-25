import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../theme';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import Header from '../../../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  searchVehicleByGroup,
  SearchVehicleResponse,
  searchWishlist,
  searchWatchlist,
} from '../../../services/searchServices';
import { images } from '../../../images';
import { ordinal } from '../../../libs/function';
import { resolveBaseUrl } from '../../../config';
import { watchlistEvents } from '../../../services/eventBus';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'vehicle' | 'category' | 'recent';
  image?: string;
  price?: string;
  year?: string;
  mileage?: string;
  vehicleData?: SearchVehicleResponse;
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterChip, isActive && styles.filterChipActive]}
  >
    <Text
      style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
    >
      {label}
    </Text>
  </Pressable>
);

interface SearchResultCardProps {
  result: SearchResult;
  onPress: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  onPress,
}) => (
  <Pressable onPress={onPress} style={styles.resultCard}>
    <View style={styles.resultContent}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {result.title}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {result.subtitle}
        </Text>
        {result.price && (
          <View style={styles.resultMeta}>
            <Text style={styles.resultPrice}>{result.price}</Text>
            {result.year && (
              <Text style={styles.resultYear}>{result.year}</Text>
            )}
            {result.mileage && (
              <Text style={styles.resultMileage}>{result.mileage}</Text>
            )}
          </View>
        )}
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </View>
  </Pressable>
);

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Search'>>();
  const { group, source } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const convertVehicleToSearchResult = (
    vehicle: SearchVehicleResponse,
  ): SearchResult => ({
    id: vehicle.vehicle_id,
    title: `${vehicle.make} ${vehicle.model} ${vehicle.variant}`,
    subtitle: `${vehicle.fuel} • ${vehicle.manufacture_year}`,
    type: 'vehicle',
    price: `₹${parseInt(vehicle.bid_amount).toLocaleString()}`,
    year: vehicle.manufacture_year,
    mileage: `${vehicle.odometer} km`,
    image: vehicle.main_image,
    vehicleData: vehicle,
  });

  const mockCategories: SearchResult[] = [
    {
      id: 'commercial',
      title: 'Commercial Vehicles',
      subtitle: 'Category • 12 vehicles',
      type: 'category',
    },
    {
      id: 'luxury',
      title: 'Luxury Cars',
      subtitle: 'Category • 8 vehicles',
      type: 'category',
    },
    {
      id: 'electric',
      title: 'Electric Vehicles',
      subtitle: 'Category • 5 vehicles',
      type: 'category',
    },
    {
      id: 'suv',
      title: 'SUVs',
      subtitle: 'Category • 15 vehicles',
      type: 'category',
    },
  ];

  const recentSearchesData = [
    'BMW X5',
    'Tesla Model 3',
    'Commercial Vehicles',
    'Luxury Cars',
  ];

  const debouncedSearch = (query: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      if (query.length > 0) {
        setShowSuggestions(true);
        setCurrentPage(1);
        setHasMoreData(true);
        performSearch(query, 1, false);
      } else {
        setShowSuggestions(false);
        setSearchResults([]);
        setSearchError(null);
        setCurrentPage(1);
        setHasMoreData(true);
      }
    }, 300);
  };

  const loadMoreResults = () => {
    if (!loadingMore && hasMoreData && searchQuery.length > 0) {
      const nextPage = currentPage + 1;
      performSearch(searchQuery, nextPage, true);
    }
  };

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const performSearch = async (query: string, page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }
    setSearchError(null);

    try {
      let vehicleResults: SearchVehicleResponse[] | { data?: SearchVehicleResponse[] } = [] as any;
      let paginationInfo: { total: number; page: number; pageSize: number; totalPages: number } | null = null;

      if (source === 'wishlist') {
        const response = await searchWishlist(query, 20, page) as any;
        vehicleResults = response.data || response;
        paginationInfo = response;
      } else if (source === 'watchlist') {
        const response = await searchWatchlist(query, 20, page) as any;
        vehicleResults = response.data || response;
        paginationInfo = response;
      } else {
        // Default: search by group
        const response = await searchVehicleByGroup({
          keyword: query,
          type: group?.type || 'state',
          title: group?.title || 'North',
          limit: 20,
          page,
        }) as any;
        vehicleResults = response.data || response;
        paginationInfo = response;
      }

      // Convert API results to search results
      const normalizedList: SearchVehicleResponse[] = Array.isArray(vehicleResults)
        ? vehicleResults as SearchVehicleResponse[]
        : (((vehicleResults as any)?.data as SearchVehicleResponse[]) || []);

      const vehicleSearchResults = normalizedList.map(
        convertVehicleToSearchResult,
      );

      // Filter categories based on query
      const filteredCategories = mockCategories.filter(
        category =>
          category.title.toLowerCase().includes(query.toLowerCase()) ||
          category.subtitle.toLowerCase().includes(query.toLowerCase()),
      );

      // Combine results based on active filter
      let combinedResults: SearchResult[] = [];

      if (activeFilter === 'all') {
        combinedResults = [...vehicleSearchResults];
      } else if (activeFilter === 'vehicles') {
        combinedResults = vehicleSearchResults;
      } else if (activeFilter === 'categories') {
        combinedResults = filteredCategories;
      }

      if (append) {
        setSearchResults(prev => [...prev, ...combinedResults]);
      } else {
        setSearchResults(combinedResults);
      }

      // Update pagination info
      if (paginationInfo) {
        setCurrentPage(paginationInfo.page);
        setTotalPages(paginationInfo.totalPages);
        setHasMoreData(paginationInfo.page < paginationInfo.totalPages);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search vehicles. Please try again.');
      if (!append) {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding suggestions to allow for result selection
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setRecentSearches(prev => {
        const newRecent = [
          searchQuery,
          ...prev.filter(item => item !== searchQuery),
        ];
        return newRecent.slice(0, 5);
      });
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'vehicle' && result.vehicleData) {
      console.log('check result ', result);
      navigation.navigate('VehicleDetail', {
        vehicle: {
          ...result.vehicleData,
          id: result.vehicleData.vehicle_id, // Add the missing id field
          image:
          `${resolveBaseUrl()}/data-files/vehicles/${result.vehicleData.vehicleId}/${result.vehicleData.imgIndex}.${result.vehicleData.img_extension}`,
          endTime: result.vehicleData.end_time,
          status: result.vehicleData.has_bidded ? 'Winning' : 'Losing',
        owner: `${ordinal(Number(result.vehicleData.owner_serial)) === '0th' ? 'Current Owner' : `${ordinal(Number(result.vehicleData.owner_serial))} Owner`}` as string,
          title: `${result.vehicleData.make} ${result.vehicleData.model} ${result.vehicleData.variant} (${result.vehicleData.manufacture_year})`,
          kms: result.vehicleData.odometer,
          region: result.vehicleData.state_code || result.vehicleData.state_rto,
          has_bidded: result.vehicleData.has_bidded,
        },
        id: result.id,
      });
    } else if (result.type === 'category') {
      navigation.navigate('VehicleList', {
        group: { type: result.title, title: result.title },
      });
    }
  };

  // If any card toggles favorite, we might want to update list visuals promptly (optional)
  useEffect(() => {
    const unsubscribe = watchlistEvents.subscribe(() => {
      // no-op: Search results are ephemeral; could re-run current search if needed
      // performSearch(searchQuery);
    });
    return unsubscribe;
  }, [searchQuery]);

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={theme.colors.textMuted}
            />
          </Pressable>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputContainer,
                isSearchFocused && styles.searchInputFocused,
              ]}
            >
              <Icon
                name="search"
                size={20}
                color={
                  isSearchFocused
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search vehicles, categories..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={clearSearch} style={styles.clearButton}>
                  <Icon
                    name="close-circle"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Search Results or Suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            {searchQuery.length === 0 ? (
              // Recent Searches
              <View>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearchesData.map((search, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleRecentSearchPress(search)}
                    style={styles.recentSearchItem}
                  >
                    <Icon
                      name="time-outline"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                    <Text style={styles.recentSearchText}>{search}</Text>
                    <Icon
                      name="arrow-up-left"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            ) : (
              // Search Results
              <View>
                <Text style={styles.sectionTitle}>
                  {isLoading
                    ? 'Searching...'
                    : searchError
                    ? 'Search Error'
                    : searchResults.length > 0
                    ? `Search Results${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}`
                    : 'No results found'}
                </Text>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                    <Text style={styles.loadingText}>
                      Searching vehicles...
                    </Text>
                  </View>
                ) : searchError ? (
                  <View style={styles.errorContainer}>
                    <Icon
                      name="alert-circle-outline"
                      size={48}
                      color={theme.colors.error}
                    />
                    <Text style={styles.errorText}>{searchError}</Text>
                    <Pressable
                      onPress={() => {
                        setCurrentPage(1);
                        setHasMoreData(true);
                        performSearch(searchQuery, 1, false);
                      }}
                      style={styles.retryButton}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </Pressable>
                  </View>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map(result => (
                      <SearchResultCard
                        key={result.id}
                        result={result}
                        onPress={() => handleResultPress(result)}
                      />
                    ))}
                    {hasMoreData && searchResults.length > 0 && (
                      <Pressable
                        onPress={loadMoreResults}
                        disabled={loadingMore}
                        style={[
                          styles.loadMoreButton,
                          loadingMore && styles.loadMoreButtonDisabled
                        ]}
                      >
                        {loadingMore ? (
                          <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.textInverse}
                            />
                            <Text style={styles.loadMoreButtonText}>
                              Loading more...
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.loadMoreButtonText}>
                            Load More Results
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icon
                      name="search-outline"
                      size={48}
                      color={theme.colors.textMuted}
                    />
                    <Text style={styles.noResultsText}>
                      No results found for "{searchQuery}"
                    </Text>
                    <Text style={styles.noResultsSubtext}>
                      Try different keywords or check spelling
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '12%',
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    // backgroundColor: 'red',
    gap: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
    // marginHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    // backgroundColor: 'red',
  },
  searchInputContainer: {
    flexDirection: 'row',
    // flex: 1,
    width: '80%',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    height: 52,
    ...theme.shadows.sm,
  },
  searchInputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    ...theme.shadows.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    flexGrow: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  filtersContainer: {
    paddingBottom: theme.spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
  },
  suggestionsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semibold,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  recentSearchText: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  resultCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.semibold,
  },
  resultSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultPrice: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    fontFamily: theme.fonts.semibold,
  },
  resultYear: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  resultMileage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  errorText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
  },
  retryButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.medium,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  noResultsText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    fontFamily: theme.fonts.semibold,
  },
  noResultsSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  loadingMoreText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  loadMoreButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  loadMoreButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  loadMoreButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    fontFamily: theme.fonts.semibold,
  },
  popularContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.semibold,
  },
  categoryCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
});

export default SearchScreen;
