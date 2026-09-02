import {hasGate, resolveEpisodeDir} from '../paths';

/**
 * Publish stub. Never auto-publishes. Refuses unless PUBLISH_GO exists.
 * Does not implement social posting.
 */
export const publishStage = async (slug: string) => {
  if (!hasGate(slug, 'publishGo')) {
    throw new Error(
      `Publish refused for ${slug}. Missing ${resolveEpisodeDir(slug)}/PUBLISH_GO. ` +
        `This factory never auto-publishes and has no social posting APIs.`,
    );
  }
  throw new Error(
    `PUBLISH_GO is present for ${slug}, but this repo still does not implement social posting. ` +
      `Upload the file in package/ manually.`,
  );
};
