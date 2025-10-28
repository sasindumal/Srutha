class Video {
  final String id;
  final String title;
  final String channelId;
  final String channelName;
  final String? description;
  final String? thumbnailUrl;
  final String url;
  final Duration? duration;
  final DateTime? uploadDate;
  final int? viewCount;

  Video({
    required this.id,
    required this.title,
    required this.channelId,
    required this.channelName,
    this.description,
    this.thumbnailUrl,
    required this.url,
    this.duration,
    this.uploadDate,
    this.viewCount,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'channelId': channelId,
      'channelName': channelName,
      'description': description,
      'thumbnailUrl': thumbnailUrl,
      'url': url,
      'durationSeconds': duration?.inSeconds,
      'uploadDate': uploadDate?.toIso8601String(),
      'viewCount': viewCount,
    };
  }

  factory Video.fromMap(Map<String, dynamic> map) {
    return Video(
      id: map['id'] as String,
      title: map['title'] as String,
      channelId: map['channelId'] as String,
      channelName: map['channelName'] as String,
      description: map['description'] as String?,
      thumbnailUrl: map['thumbnailUrl'] as String?,
      url: map['url'] as String,
      duration: map['durationSeconds'] != null 
          ? Duration(seconds: map['durationSeconds'] as int) 
          : null,
      uploadDate: map['uploadDate'] != null 
          ? DateTime.parse(map['uploadDate'] as String) 
          : null,
      viewCount: map['viewCount'] as int?,
    );
  }

  String get formattedDuration {
    if (duration == null) return '';
    final hours = duration!.inHours;
    final minutes = duration!.inMinutes.remainder(60);
    final seconds = duration!.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '$hours:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  String get formattedViews {
    if (viewCount == null) return '';
    if (viewCount! >= 1000000) {
      return '${(viewCount! / 1000000).toStringAsFixed(1)}M views';
    } else if (viewCount! >= 1000) {
      return '${(viewCount! / 1000).toStringAsFixed(1)}K views';
    }
    return '$viewCount views';
  }
}
