import {FPS} from './constants';
import type {EpisodeSpec, GradeSpec, SceneSpec} from './types';
import type {SceneProps} from './schemas';

export const secToFrames = (sec: number, fps = FPS): number =>
  Math.max(1, Math.round(sec * fps));

export const episodeDurationInFrames = (episode: EpisodeSpec): number =>
  episode.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);

export const getScene = (episode: EpisodeSpec, sceneId: string): SceneSpec => {
  const scene = episode.scenes.find((item) => item.id === sceneId);
  if (!scene) {
    throw new Error(`Unknown scene "${sceneId}" in episode "${episode.id}"`);
  }
  return scene;
};

export const getVoiceoverLine = (episode: EpisodeSpec, lineId: string) => {
  const line = episode.voiceover.find((item) => item.id === lineId);
  if (!line) {
    throw new Error(`Unknown voiceover line "${lineId}" in episode "${episode.id}"`);
  }
  return line;
};

export const mergeGrade = (
  base: GradeSpec,
  override?: Partial<GradeSpec>,
): GradeSpec => ({
  contrast: override?.contrast ?? base.contrast,
  saturation: override?.saturation ?? base.saturation,
  brightness: override?.brightness ?? base.brightness,
  cool: override?.cool ?? base.cool,
  warm: override?.warm ?? base.warm ?? 0,
  grain: override?.grain ?? base.grain ?? 0,
  vignette: override?.vignette ?? base.vignette,
});

export const sceneSpecToProps = (
  episode: EpisodeSpec,
  sceneId: string,
): SceneProps => {
  const scene = getScene(episode, sceneId);
  const line = getVoiceoverLine(episode, scene.voiceoverLineId);

  return {
    sceneId: scene.id,
    timing: {
      durationInFrames: scene.durationInFrames,
      fadeInFrames: scene.fadeInFrames ?? 10,
      fadeOutFrames: scene.fadeOutFrames ?? 10,
    },
    motion: scene.motion,
    grade: mergeGrade(episode.grade, scene.grade),
    caption: {
      text: scene.captions.text || line.text,
      kicker: scene.captions.kicker,
      highlightBias: scene.captions.highlightBias,
    },
  };
};
