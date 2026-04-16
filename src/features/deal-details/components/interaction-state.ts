export type VoteValue = -1 | 0 | 1;

export type VoteState = {
  vote: VoteValue;
  score: number;
  upvotes: number;
  downvotes: number;
};

export function applyOptimisticVote(state: VoteState, nextVote: 1 | -1): VoteState {
  const { vote: prevVote } = state;

  let scoreDelta = 0;
  let upvoteDelta = 0;
  let downvoteDelta = 0;
  let vote: VoteValue = nextVote;

  if (prevVote === nextVote) {
    vote = 0;
    scoreDelta = -nextVote;
    if (nextVote === 1) upvoteDelta = -1;
    if (nextVote === -1) downvoteDelta = -1;
  } else if (prevVote === 0) {
    scoreDelta = nextVote;
    if (nextVote === 1) upvoteDelta = 1;
    if (nextVote === -1) downvoteDelta = 1;
  } else {
    scoreDelta = nextVote * 2;
    if (nextVote === 1) {
      upvoteDelta = 1;
      downvoteDelta = -1;
    } else {
      upvoteDelta = -1;
      downvoteDelta = 1;
    }
  }

  return {
    vote,
    score: state.score + scoreDelta,
    upvotes: Math.max(0, state.upvotes + upvoteDelta),
    downvotes: Math.max(0, state.downvotes + downvoteDelta),
  };
}

export function applyOptimisticSave(isSaved: boolean, bookmarks: number) {
  const nextSaved = !isSaved;

  return {
    isSaved: nextSaved,
    bookmarks: Math.max(0, bookmarks + (nextSaved ? 1 : -1)),
  };
}
