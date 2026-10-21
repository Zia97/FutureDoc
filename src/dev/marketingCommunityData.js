// Fictional community content and interactions live only in memory.
const authors = [
  { id: 'marketing-member-maya', displayName: 'Maya Patel', tag: '2841' },
  { id: 'marketing-member-james', displayName: 'James Wilson', tag: '6137' },
  { id: 'marketing-member-amira', displayName: 'Amira Khan', tag: '4296' },
  { id: 'marketing-member-oliver', displayName: 'Oliver Chen', tag: '8052' },
  { id: 'marketing-member-sophie', displayName: 'Sophie Evans', tag: '3719' },
  { id: 'marketing-member-daniel', displayName: 'Daniel Okafor', tag: '5628' },
];
const me = { id: 'marketing-member-me', displayName: 'Alex Morgan', tag: '7403' };
const discussions = [
  { title: 'What helped you get faster at Verbal Reasoning?',
    body: 'My accuracy is improving, but I still spend too long looking for evidence. Do you read the passage first or go straight to the questions? I would love to hear what has worked in your practice.',
    replies: [
      'I look for a name, date or unusual word in the question, then find that part of the passage. Reading the sentence before and after it helps me avoid missing the context.',
      'Same here. I also keep a note of questions where I spent ages searching. It is usually a paraphrase I did not recognise rather than the reading itself.',
      'That makes sense. I have been searching for the exact wording every time. Going to try this in my next set!',
      'For author viewpoint questions I do a quick read of the whole passage. I use the targeted search approach for detail questions.',
    ] },
  { title: 'A small QR win: finally getting percentage change right',
    body: 'Went from 61% to 76% in my recent practice sets. Writing down the original value before reaching for the calculator has made a big difference. Still need to work on my timing!',
    replies: [
      'Well done! Mixing up the original and final value is exactly where I lose marks. Going to add that to my review notes.',
      'I try to estimate the direction and rough size of the change first. It makes it easier to spot when I have typed something wrong.',
      'Thank you! The estimate is a good idea, especially when the options are far apart.',
    ] },
  { title: 'How are you reviewing mistakes after a timed test?',
    body: 'I used to read the explanation and move on. Now I am trying to write one sentence about why my answer was wrong. Does anyone have a review routine that is easy to keep up with?',
    replies: [
      'I use three headings: misunderstood the question, missed a step, and ran out of time. Then I choose one thing to practise the next day.',
      'I redo a few of the missed questions later in the week without looking at my notes first. It helps me see whether I understood the explanation.',
      'The one-sentence rule sounds manageable. My notes were getting longer than the practice session!',
      'I include questions I guessed correctly too. Otherwise I forget there was a gap in my reasoning.',
    ] },
  { title: 'Decision Making: keeping Venn diagrams tidy',
    body: 'I keep putting numbers into the wrong region when there are three sets. Has anyone found a way to lay out their working so it is easier to check?',
    replies: [
      'I fill in the three-way overlap first, then the two-way overlaps, then the single-set regions. I label each region as I go.',
      'Checking that all the regions add back up to the total has caught a lot of my mistakes.',
      'I was starting with the single sets. Going to try working from the middle out instead, thanks both!',
    ] },
  { title: 'SJT discussions: how do you compare two close options?',
    body: 'Sometimes I can rule out two answers, but the remaining options both seem reasonable. I am trying to explain my choice before opening the answer. What do you look for when reviewing these?',
    replies: [
      'I ask what the action actually does, rather than what the person probably intended. That often changes how I read it.',
      'I look at whether the action addresses the immediate concern and whether it stays within the person\'s role.',
      'Reading why the neighbouring rating gets partial credit has helped me understand where I was close and where I missed the main issue.',
    ] },
  { title: 'Anyone balancing UCAT practice with school this week?',
    body: 'Trying to keep my sessions realistic around homework. My plan is a short targeted set on weekdays and a timed section at the weekend. Interested to hear how others split their time.',
    replies: [
      'That is similar to my routine. I leave a little time for reviewing the set so I do not end up with a pile of explanations to catch up on.',
      'I do a smaller session on busy days. Keeping the habit has been easier than trying to make every session the same length.',
      'I put review time in the plan as well as question time. It helped me stop rushing straight into another test.',
    ] },
  { title: 'What is in your mistake notebook?',
    body: 'Mine currently has unit conversions, qualifiers in VR and a reminder to check what the question is actually asking. Curious which patterns other people have noticed in their own practice.',
    replies: [
      'Mine says “a percentage of which total?” more often than I would like to admit.',
      'For VR: do not turn “some” into “all”. Such a small word but it changes the whole answer.',
      'For DM I write the rule in symbols before I try the options. It makes it easier to catch when I have reversed a condition.',
    ] },
  { title: 'First full week of consistent practice done',
    body: 'Managed a short session every day this week and actually reviewed the questions I missed. My next focus is conditional logic. Posting this so I remember to check back on it next week.',
    replies: [
      'Nice work keeping the review part going too. Conditional logic is on my list this week as well.',
      'I found writing my own example of a rule useful before doing the next question. Good luck with your next set!',
      'Thank you! I am going to start with the technique lesson and then try a fresh set.',
    ] },
];

export const isMarketingCommunityId = (id) => typeof id === 'string' && id.startsWith('marketing-');

export function createMarketingCommunity(now = Date.now()) {
  let sequence = 0;
  const listeners = new Set();
  const threads = {};
  const posts = discussions.map((discussion, index) => {
    const id = `marketing-post-${index + 1}`;
    const postedAgo = (index + 1) * 4 * 3600000;
    const author = index === discussions.length - 1 ? me : authors[index % authors.length];
    const replies = discussion.replies.map((body, replyIndex) => ({
      id: `${id}-reply-${replyIndex + 1}`, postId: id, body, status: 'published',
      author: replyIndex === 2 ? author : authors[(index + replyIndex + 1) % authors.length],
      parentReplyId: replyIndex === 2 ? `${id}-reply-1` : null,
      createdAt: new Date(now - postedAgo + (replyIndex + 1) * 20 * 60000).toISOString(),
      likedByMe: index === 0 && replyIndex === 0, likeCount: [12, 8, 4, 6][replyIndex],
    }));
    const post = { id, title: discussion.title, body: discussion.body, author, status: 'published',
      createdAt: new Date(now - postedAgo).toISOString(), replyCount: replies.length,
      likeCount: [24, 31, 18, 16, 21, 14, 19, 27][index], likedByMe: index === 1, isLocked: false, images: [] };
    threads[id] = { post, replies, nextCursor: null };
    return post;
  });
  let snapshot = { posts, threads, state: { memberId: me.id, readEnabled: true, postingEnabled: true,
    hasAcceptedGuidelines: true, isBanned: false, isAdmin: false } };
  const publish = (next) => { snapshot = next; listeners.forEach((listener) => listener()); };
  const replaceThread = (thread) => publish({ ...snapshot,
    posts: snapshot.posts.map((post) => post.id === thread.post.id ? thread.post : post),
    threads: { ...snapshot.threads, [thread.post.id]: thread } });
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    listPosts(query = '') {
      const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      return snapshot.posts.filter((post) => words.every((word) => `${post.title} ${post.body} ${post.author.displayName}`.toLowerCase().includes(word)));
    },
    getThread: (id) => snapshot.threads[id] ?? null,
    createPost({ title, body, images = [] }) {
      const post = { id: `marketing-created-post-${++sequence}`, title, body, images: images.map((image) => ({ ...image })), author: me,
        status: 'published', createdAt: new Date().toISOString(), replyCount: 0, likeCount: 0, likedByMe: false, isLocked: false };
      publish({ ...snapshot, posts: [post, ...snapshot.posts], threads: { ...snapshot.threads, [post.id]: { post, replies: [], nextCursor: null } } });
      return post;
    },
    createReply(postId, body, parentReplyId = null) {
      const thread = snapshot.threads[postId];
      if (!thread || (parentReplyId && !thread.replies.some((reply) => reply.id === parentReplyId))) return;
      const reply = { id: `marketing-created-reply-${++sequence}`, postId, body, parentReplyId, author: me,
        status: 'published', createdAt: new Date().toISOString(), likeCount: 0, likedByMe: false };
      replaceThread({ ...thread, post: { ...thread.post, replyCount: thread.replies.length + 1 }, replies: [...thread.replies, reply] });
      return reply;
    },
    toggleLike(type, id) {
      const toggle = (item) => ({ ...item, likedByMe: !item.likedByMe,
        likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)) });
      const thread = type === 'post' ? snapshot.threads[id] : Object.values(snapshot.threads).find((t) => t.replies.some((r) => r.id === id));
      if (!thread) return;
      replaceThread(type === 'post' ? { ...thread, post: toggle(thread.post) }
        : { ...thread, replies: thread.replies.map((reply) => reply.id === id ? toggle(reply) : reply) });
    },
    deleteContent(type, id) {
      if (type === 'post') {
        const nextThreads = { ...snapshot.threads }; delete nextThreads[id];
        publish({ ...snapshot, posts: snapshot.posts.filter((post) => post.id !== id), threads: nextThreads });
      } else {
        const thread = Object.values(snapshot.threads).find((t) => t.replies.some((r) => r.id === id));
        if (!thread) return;
        const replies = thread.replies.filter((r) => r.id !== id).map((r) => r.parentReplyId === id ? { ...r, parentReplyId: null } : r);
        replaceThread({ ...thread, post: { ...thread.post, replyCount: replies.length }, replies });
      }
    },
  };
}
