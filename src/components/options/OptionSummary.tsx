import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, List, Target, Calendar, X, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { DecisionCardProps } from '@/types';
import { useDecisionOptions } from '@/app/counselor/context/DecisionOptionContext';

export const DecisionCard = ({ option, onStatusChange }: DecisionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { generateNewOption, fetchDecisionOptions } = useDecisionOptions();


  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!option.topicId) return;
    // Update local state
    onStatusChange?.(option.id, 'accepted');

    try {
      await Promise.all([
        // Post the acceptance message
        fetch('/api/counselor/message/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `I have selected "${option.name}" as my final choice.`,
            role: 'user',
            topicId: option.topicId
          })
        }),

        // Update the option status
        fetch('/api/counselor/option/patch', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: option.id,
            status: 'accepted'
          })
        })
      ]);

      await fetchDecisionOptions();
    } catch (error) {
      console.error('Error accepting option:', error);
    }
  };

  const getCardStyles = (status: string = 'pending') => {
    switch(status) {
      case 'accepted':
        return 'bg-green-50 border-2 border-green-200';
      case 'rejected':
        return 'bg-white opacity-75';
      default:
        return 'bg-white';
    }
  };

  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim() || !onStatusChange || !option.topicId) return;

    try {
      await Promise.all([
        // Post the rejection message
        fetch('/api/counselor/message/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `I have rejected the option "${option.name}". Reason: ${rejectionReason}`,
            role: 'user',
            topicId: option.topicId
          })
        }),

        // Update the option status
        fetch('/api/counselor/option/patch', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: option.id,
            status: 'rejected'
          })
        })
      ]);

      // Update local state
      onStatusChange(option.id, 'rejected');
      setShowRejectionInput(false);
      setRejectionReason('');

      // Generate new option and refresh list
      await generateNewOption();
      await fetchDecisionOptions();
    } catch (error) {
      console.error('Error submitting rejection:', error);
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRejectionInput(true);
  };

  const getStatusColor = (status: string = 'pending') => {
    switch(status) {
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string = 'pending') => {
    switch(status) {
      case 'accepted': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'rejected': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${getCardStyles(option.status)}`}>
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {option.name || 'Untitled Option'}
              </h3>
              {option.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-sm border ${getStatusColor(option.status)} flex items-center gap-1`}>
                  {getStatusIcon(option.status)}
                  <span className="capitalize">{option.status}</span>
                </span>
              )}
            </div>
            {option.description && (
              <p className="mt-2 text-gray-600">
                {option.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {(!option.status || option.status === 'pending') && (
              <>
                <button
                  onClick={handleAccept}
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors duration-200"
                  title="Accept option"
                >
                  <CheckCircle className="h-6 w-6" />
                </button>
                <button
                  onClick={handleReject}
                  className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
                  title="Reject option"
                >
                  <X className="h-6 w-6" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors duration-200"
            >
              {isExpanded ? 
                <ChevronUp className="h-6 w-6" /> : 
                <ChevronDown className="h-6 w-6" />
              }
            </button>
          </div>
        </div>

        {/* Rejection Input Section */}
        {showRejectionInput && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="text-red-700 font-medium mb-2">Why are you rejecting this option?</h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              rows={3}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowRejectionInput(false)}
                className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRejection}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Accepted Message */}
        {option.status === 'accepted' && (
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">This option has been selected as the final choice</span>
          </div>
        )}

        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Why Good Fit Section */}
            {option.fitReasons && option.fitReasons.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Target className="h-5 w-5" />
                  <h4 className="font-medium">Why This is a Good Fit</h4>
                </div>
                <ul className="ml-6 space-y-2">
                  {option.fitReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics Section */}
            {option.metrics && option.metrics.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <List className="h-5 w-5" />
                  <h4 className="font-medium">Key Metrics</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {option.metrics.map((metric, index) => {
                    const [label, value] = metric.split(':');
                    return (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-700">{label}</div>
                        <div className="text-lg font-semibold text-blue-900">{value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Implementation Steps */}
            {option.implementationSteps && option.implementationSteps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <List className="h-5 w-5" />
                  <h4 className="font-medium">Implementation Steps</h4>
                </div>
                <ol className="ml-6 space-y-4">
                  {option.implementationSteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Timeline Section */}
            {option.timeline && option.timeline.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <Calendar className="h-5 w-5" />
                  <h4 className="font-medium">What Happens After</h4>
                </div>
                <div className="ml-6 space-y-4">
                  {option.timeline.map((timelineItem, index) => {
                    const [time, event] = timelineItem.split(':');
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full" />
                          {index !== option.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-orange-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-sm font-medium text-orange-700">
                            {time}
                          </div>
                          <div className="text-gray-700">
                            {event}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};