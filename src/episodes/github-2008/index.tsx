import React from 'react';
import {
  EpisodeTimeline,
  episodeDurationInFrames,
  episodeSchema,
  type EpisodeProps,
  type SceneModule,
} from '../../engine';
import {github2008Spec} from './spec';
import {
  Scene01FridayNight,
  defaultProps as scene01Props,
} from './scenes/Scene01FridayNight';
import {
  Scene02FirstCommit,
  defaultProps as scene02Props,
} from './scenes/Scene02FirstCommit';
import {
  Scene03DayJob,
  defaultProps as scene03Props,
} from './scenes/Scene03DayJob';
import {
  Scene04EverySaturday,
  defaultProps as scene04Props,
} from './scenes/Scene04EverySaturday';
import {
  Scene05TwoLaptops,
  defaultProps as scene05Props,
} from './scenes/Scene05TwoLaptops';
import {
  Scene06NightsWeekends,
  defaultProps as scene06Props,
} from './scenes/Scene06NightsWeekends';
import {
  Scene07InviteOnly,
  defaultProps as scene07Props,
} from './scenes/Scene07InviteOnly';
import {
  Scene08Opened,
  defaultProps as scene08Props,
} from './scenes/Scene08Opened';

export {github2008Spec};

export const github2008Scenes: SceneModule[] = [
  {
    id: 's01',
    voiceoverLineId: 'vo-01',
    compositionId: 'Github2008-01',
    component: Scene01FridayNight,
    defaultProps: scene01Props,
  },
  {
    id: 's02',
    voiceoverLineId: 'vo-02',
    compositionId: 'Github2008-02',
    component: Scene02FirstCommit,
    defaultProps: scene02Props,
  },
  {
    id: 's03',
    voiceoverLineId: 'vo-03',
    compositionId: 'Github2008-03',
    component: Scene03DayJob,
    defaultProps: scene03Props,
  },
  {
    id: 's04',
    voiceoverLineId: 'vo-04',
    compositionId: 'Github2008-04',
    component: Scene04EverySaturday,
    defaultProps: scene04Props,
  },
  {
    id: 's05',
    voiceoverLineId: 'vo-05',
    compositionId: 'Github2008-05',
    component: Scene05TwoLaptops,
    defaultProps: scene05Props,
  },
  {
    id: 's06',
    voiceoverLineId: 'vo-06',
    compositionId: 'Github2008-06',
    component: Scene06NightsWeekends,
    defaultProps: scene06Props,
  },
  {
    id: 's07',
    voiceoverLineId: 'vo-07',
    compositionId: 'Github2008-07',
    component: Scene07InviteOnly,
    defaultProps: scene07Props,
  },
  {
    id: 's08',
    voiceoverLineId: 'vo-08',
    compositionId: 'Github2008-08',
    component: Scene08Opened,
    defaultProps: scene08Props,
  },
];

export const github2008EpisodeProps: EpisodeProps = {
  episodeId: github2008Spec.id,
  title: github2008Spec.title,
};

export const github2008DurationInFrames =
  episodeDurationInFrames(github2008Spec);

export const Github2008Episode: React.FC<EpisodeProps> = ({
  episodeId,
  title,
}) => {
  return (
    <EpisodeTimeline
      episode={{...github2008Spec, id: episodeId, title}}
      scenes={github2008Scenes}
    />
  );
};

export const github2008EpisodeSchema = episodeSchema;
