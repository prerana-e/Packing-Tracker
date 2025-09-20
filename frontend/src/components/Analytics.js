import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api';
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [progress, setProgress] = useState([]);
  const [tagStats, setTagStats] = useState([]);
  const [scheduleAnalytics, setScheduleAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewResponse, progressResponse, tagStatsResponse, scheduleResponse] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getProgress(),
        analyticsAPI.getTagStats(),
        analyticsAPI.getScheduleAnalytics()
      ]);

      setOverview(overviewResponse.data);
      setProgress(progressResponse.data);
      setTagStats(tagStatsResponse.data);
      setScheduleAnalytics(scheduleResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPackingRate = () => {
    if (!overview?.overview) return 0;
    const { packed_items, total_items } = overview.overview;
    return calculatePercentage(packed_items, total_items);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="h-8 w-8 text-primary-600" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Track your packing progress and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {overview?.overview?.total_items || 0}
              </h3>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>

        {/* Packed Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {overview?.overview?.packed_items || 0}
              </h3>
              <p className="text-sm text-gray-600">Items Packed</p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getPackingRate()}%
              </h3>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Schedule Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {overview?.scheduleEvents?.reduce((sum, event) => sum + event.event_count, 0) || 0}
              </h3>
              <p className="text-sm text-gray-600">Scheduled Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packing Progress by Category</h3>
          {overview?.categories && overview.categories.length > 0 ? (
            <div className="space-y-4">
              {overview.categories.map(category => {
                const percentage = calculatePercentage(category.packed, category.total);
                return (
                  <div key={category.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.packed}/{category.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {overview?.recentActivity && overview.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {overview.recentActivity.slice(0, 7).map(activity => (
                <div key={activity.date} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{formatDate(activity.date)}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activity.items_updated} item{activity.items_updated !== 1 ? 's' : ''} updated
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Most Used Tags
          </h3>
          {tagStats && tagStats.length > 0 ? (
            <div className="space-y-3">
              {tagStats.slice(0, 5).map((tag, index) => (
                <div key={tag.tag} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{tag.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (tag.count / Math.max(...tagStats.map(t => t.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{tag.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tags data available</p>
          )}
        </div>

        {/* Schedule Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Schedule Insights
          </h3>
          {scheduleAnalytics ? (
            <div className="space-y-4">
              {/* Event Types */}
              {scheduleAnalytics.duration && scheduleAnalytics.duration.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Events by Day Type</h4>
                  {scheduleAnalytics.duration.map(item => (
                    <div key={item.day_type} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 capitalize">
                        {item.day_type.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.event_count} event{item.event_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Average Duration */}
              {scheduleAnalytics.duration && scheduleAnalytics.duration.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Average Event Duration</h4>
                  {scheduleAnalytics.duration.map(item => (
                    <div key={`duration-${item.day_type}`} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 capitalize">
                        {item.day_type.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(item.avg_duration_minutes || 0)} min
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Events with linked items */}
              {scheduleAnalytics.linkedItems && scheduleAnalytics.linkedItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Events with Linked Items</h4>
                  {scheduleAnalytics.linkedItems.map(item => {
                    const percentage = calculatePercentage(item.events_with_items, item.total_events);
                    return (
                      <div key={`linked-${item.day_type}`} className="py-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 capitalize">
                            {item.day_type.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-gray-900">
                            {item.events_with_items}/{item.total_events} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-600 h-1 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No schedule data available</p>
          )}
        </div>
      </div>

      {/* Progress Over Time */}
      {progress && progress.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packing Progress Over Time</h3>
          <div className="space-y-2">
            {progress.slice(-10).map(day => {
              const percentage = calculatePercentage(day.packed_items, day.total_items);
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-16">{formatDate(day.date)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">
                        {day.packed_items}/{day.total_items} items
                      </span>
                      <span className="text-xs text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
