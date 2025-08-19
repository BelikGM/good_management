import { createPathInOneDivision } from './createPathInOneDivision';

export function createPathFromSenderToRecieverPost(
  postIdsFromSenderToTop: string[],
  postIdsFromRecieverToTop: string[],
): { postIdsFromSenderToReciver: string[]; isCommonDivision: boolean } {
  const isCommonDivision = postIdsFromSenderToTop.some((postId) =>
    postIdsFromRecieverToTop.includes(postId),
  );

  const postIdsFromSenderToReciver: string[] = [];
  if (isCommonDivision) {
    postIdsFromSenderToReciver.push(
      ...createPathInOneDivision(
        postIdsFromSenderToTop,
        postIdsFromRecieverToTop,
      ),
    );
  } else {
    postIdsFromRecieverToTop.reverse();
    postIdsFromSenderToReciver.push(
      ...postIdsFromSenderToTop.concat(postIdsFromRecieverToTop),
    );
  }

  return { postIdsFromSenderToReciver, isCommonDivision };
}
