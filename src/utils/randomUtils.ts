export function randint(start: number, end: number) {
  if (start >= end) {
    throw new Error("start  must always be less than end");
  }
  const num = start + Math.random() * (start - end + 1);
  return Math.floor(num);
}

export function shuffle(array: any[]) {
  const arrlen = array.length;
  for (let i = 0; i < array.length; i++) {
    const j = randint(0, arrlen - 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}
