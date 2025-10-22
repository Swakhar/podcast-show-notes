import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  platforms: string[];
  category: 'Social' | 'Professional' | 'Marketing' | 'Educational';
}

interface ContentTypeSelectorProps {
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
  maxSelections?: number;
}

export default function ContentTypeSelector({ 
  selectedTypes, 
  onSelectionChange, 
  maxSelections = 4 
}: ContentTypeSelectorProps) {
  const { t } = useTranslation('common');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'time' | 'difficulty'>('name');

  // Use translation for content types
  const CONTENT_TYPES: ContentType[] = [
    {
      id: 'linkedin_carousel',
      name: t('contentTypeSelector.types.linkedinCarousel.name'),
      icon: '📊',
      description: t('contentTypeSelector.types.linkedinCarousel.description'),
      estimatedTime: t('contentTypeSelector.types.linkedinCarousel.estimatedTime'),
      difficulty: 'Medium',
      platforms: [t('contentTypeSelector.platforms.linkedin')],
      category: 'Professional'
    },
    {
      id: 'twitter_thread',
      name: t('contentTypeSelector.types.twitterThread.name'),
      icon: '🧵',
      description: t('contentTypeSelector.types.twitterThread.description'),
      estimatedTime: t('contentTypeSelector.types.twitterThread.estimatedTime'),
      difficulty: 'Easy',
      platforms: [t('contentTypeSelector.platforms.twitter')],
      category: 'Social'
    },
    {
      id: 'instagram_story',
      name: t('contentTypeSelector.types.instagramStory.name'),
      icon: '📱',
      description: t('contentTypeSelector.types.instagramStory.description'),
      estimatedTime: t('contentTypeSelector.types.instagramStory.estimatedTime'),
      difficulty: 'Medium',
      platforms: [t('contentTypeSelector.platforms.instagram')],
      category: 'Social'
    },
    {
      id: 'tiktok_script',
      name: t('contentTypeSelector.types.tiktokScript.name'),
      icon: '🎬',
      description: t('contentTypeSelector.types.tiktokScript.description'),
      estimatedTime: t('contentTypeSelector.types.tiktokScript.estimatedTime'),
      difficulty: 'Advanced',
      platforms: [t('contentTypeSelector.platforms.tiktok'), t('contentTypeSelector.platforms.instagramReels'), t('contentTypeSelector.platforms.youtubeShorts')],
      category: 'Social'
    },
    {
      id: 'blog_outline',
      name: t('contentTypeSelector.types.blogOutline.name'),
      icon: '📝',
      description: t('contentTypeSelector.types.blogOutline.description'),
      estimatedTime: t('contentTypeSelector.types.blogOutline.estimatedTime'),
      difficulty: 'Medium',
      platforms: [t('contentTypeSelector.platforms.website'), t('contentTypeSelector.platforms.medium'), t('contentTypeSelector.platforms.linkedinArticles')],
      category: 'Educational'
    },
    {
      id: 'email_course',
      name: t('contentTypeSelector.types.emailCourse.name'),
      icon: '📧',
      description: t('contentTypeSelector.types.emailCourse.description'),
      estimatedTime: t('contentTypeSelector.types.emailCourse.estimatedTime'),
      difficulty: 'Advanced',
      platforms: [t('contentTypeSelector.platforms.emailMarketing')],
      category: 'Marketing'
    },
    {
      id: 'infographic_data',
      name: t('contentTypeSelector.types.infographicData.name'),
      icon: '📈',
      description: t('contentTypeSelector.types.infographicData.description'),
      estimatedTime: t('contentTypeSelector.types.infographicData.estimatedTime'),
      difficulty: 'Medium',
      platforms: [t('contentTypeSelector.platforms.socialMedia'), t('contentTypeSelector.platforms.presentations'), t('contentTypeSelector.platforms.reports')],
      category: 'Marketing'
    }
  ];

  const categories = [
    t('contentTypeSelector.categories.all'),
    t('contentTypeSelector.categories.social'),
    t('contentTypeSelector.categories.professional'),
    t('contentTypeSelector.categories.marketing'),
    t('contentTypeSelector.categories.educational')
  ];

  const filteredTypes = CONTENT_TYPES.filter(type => 
    filterCategory === 'All' || type.category === filterCategory
  ).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'time') return a.estimatedTime.localeCompare(b.estimatedTime);
    if (sortBy === 'difficulty') {
      const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Advanced': 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    return 0;
  });

  const toggleSelection = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onSelectionChange(selectedTypes.filter(id => id !== typeId));
    } else if (selectedTypes.length < maxSelections) {
      onSelectionChange([...selectedTypes, typeId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('contentTypeSelector.header.title')}</h2>
        <p className="text-gray-600">
          {t('contentTypeSelector.header.subtitle', { maxSelections })}
        </p>
        <div className="mt-3 text-sm text-gray-500">
          {t('contentTypeSelector.header.selectionCount', { selected: selectedTypes.length, max: maxSelections })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('contentTypeSelector.controls.category')}:</span>
          <div className="flex gap-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('contentTypeSelector.controls.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 text-xs border border-gray-300 rounded-lg bg-white"
          >
            <option value="name">{t('contentTypeSelector.controls.sortOptions.name')}</option>
            <option value="time">{t('contentTypeSelector.controls.sortOptions.time')}</option>
            <option value="difficulty">{t('contentTypeSelector.controls.sortOptions.difficulty')}</option>
          </select>
        </div>
      </div>

      {/* Content Type Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type, index) => {
          const isSelected = selectedTypes.includes(type.id);
          const isDisabled = !isSelected && selectedTypes.length >= maxSelections;

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => !isDisabled && toggleSelection(type.id)}
            >
              {/* Selection Badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Icon and Name */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(type.difficulty)}`}>
                      {type.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">⏱️ {type.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {type.description}
              </p>

              {/* Platforms */}
              <div className="flex flex-wrap gap-1">
                {type.platforms.map(platform => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-white text-gray-500 rounded-full text-xs font-medium shadow-sm">
                  {type.category}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">{t('contentTypeSelector.summary.title')}</h4>
              <p className="text-sm text-blue-700">
                {t('contentTypeSelector.summary.estimatedTime', { min: selectedTypes.length * 3, max: selectedTypes.length * 5 })}
              </p>
            </div>
            <div className="flex -space-x-2">
              {selectedTypes.slice(0, 3).map(typeId => {
                const type = CONTENT_TYPES.find(t => t.id === typeId);
                return (
                  <div
                    key={typeId}
                    className="w-8 h-8 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center text-sm"
                    title={type?.name}
                  >
                    {type?.icon}
                  </div>
                );
              })}
              {selectedTypes.length > 3 && (
                <div className="w-8 h-8 bg-blue-500 border-2 border-blue-200 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  +{selectedTypes.length - 3}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
