import React from 'react';
import {
  EpisodeTimeline,
  episodeDurationInFrames,
  episodeSchema,
  type EpisodeProps,
  type SceneModule,
} from '../../engine';
import {quietHourSpec} from './spec';
import {
  Scene01QuietHour,
  defaultProps as scene01Props,
} from './scenes/Scene01QuietHour';
import {
  Scene02DeskWindow,
  defaultProps as scene02Props,
} from './scenes/Scene02DeskWindow';
import {
  Scene03Notebook,
  defaultProps as scene03Props,
} from './scenes/Scene03Notebook';
import {
  Scene04FocusRoom,
  defaultProps as scene04Props,
} from './scenes/Scene04FocusRoom';
import {
  Scene05CoolLight,
  defaultProps as scene05Props,
} from './scenes/Scene05CoolLight';
import {
  Scene06OnePage,
  defaultProps as scene06Props,
} from './scenes/Scene06OnePage';
import {
  Scene07KeepIt,
  defaultProps as scene07Props,
} from './scenes/Scene07KeepIt';

export {quietHourSpec};

export const quietHourScenes: SceneModule[] = [
  {
    id: 's01',
    voiceoverLineId: 'vo-01',
    compositionId: 'QuietHour-01',
    component: Scene01QuietHour,
    defaultProps: scene01Props,
  },
  {
    id: 's02',
    voiceoverLineId: 'vo-02',
    compositionId: 'QuietHour-02',
    component: Scene02DeskWindow,
    defaultProps: scene02Props,
  },
  {
    id: 's03',
    voiceoverLineId: 'vo-03',
    compositionId: 'QuietHour-03',
    component: Scene03Notebook,
    defaultProps: scene03Props,
  },
  {
    id: 's04',
    voiceoverLineId: 'vo-04',
    compositionId: 'QuietHour-04',
    component: Scene04FocusRoom,
    defaultProps: scene04Props,
  },
  {
    id: 's05',
    voiceoverLineId: 'vo-05',
    compositionId: 'QuietHour-05',
    component: Scene05CoolLight,
    defaultProps: scene05Props,
  },
  {
    id: 's06',
    voiceoverLineId: 'vo-06',
    compositionId: 'QuietHour-06',
    component: Scene06OnePage,
    defaultProps: scene06Props,
  },
  {
    id: 's07',
    voiceoverLineId: 'vo-07',
    compositionId: 'QuietHour-07',
    component: Scene07KeepIt,
    defaultProps: scene07Props,
  },
];

export const quietHourEpisodeProps: EpisodeProps = {
  episodeId: quietHourSpec.id,
  title: quietHourSpec.title,
};

export const quietHourDurationInFrames = episodeDurationInFrames(quietHourSpec);

export const QuietHourEpisode: React.FC<EpisodeProps> = ({
  episodeId,
  title,
}) => {
  return (
    <EpisodeTimeline
      episode={{...quietHourSpec, id: episodeId, title}}
      scenes={quietHourScenes}
    />
  );
};

export const quietHourEpisodeSchema = episodeSchema;
