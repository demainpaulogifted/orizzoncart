export type FeedEntry<T> =
  | { type: 'product'; product: T; key: string }
  | { type: 'ad'; key: string };

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function insertShuffledFeedAds<T extends { id: string | number }>(
  products: T[],
  seed: string
): FeedEntry<T>[] {
  const result: FeedEntry<T>[] = [];
  let state = hash(seed);

  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  for (let start = 0; start < products.length; start += 7) {
    const group = products.slice(start, start + 7);
    const firstAdAfter = random() < 0.5 ? 2 : 3;
    const secondAdAfter = random() < 0.5 ? 6 : 7;

    group.forEach((product, index) => {
      result.push({
        type: 'product',
        product,
        key: 'product-' + String(product.id),
      });

      const count = index + 1;

      if (count === firstAdAfter) {
        result.push({ type: 'ad', key: 'ad-' + start + '-1' });
      }

      if (count === secondAdAfter) {
        result.push({ type: 'ad', key: 'ad-' + start + '-2' });
      }
    });
  }

  return result;
}
