import { describe, it, expect } from "vitest";
import {
  DASS21_ITEMS,
  DASS21_MAPPINGS,
  calculateDASS21Scores,
  getDepressionCategory,
  getAnxietyCategory,
  getStressCategory,
  getPersonalizedRecommendations,
  SAFETY_CHECK_QUESTION
} from "./dass21";

describe("DASS-21 Mental Health Assessment Engine", () => {
  it("should contain exactly 21 validated Indonesian items", () => {
    expect(DASS21_ITEMS.length).toBe(21);
    expect(DASS21_ITEMS[0].text).toBe("Saya merasa sulit untuk menjadi tenang.");
    expect(DASS21_ITEMS[20].text).toBe("Saya merasa hidup tidak berarti.");
  });

  it("should have correct subscale item mapping (7 items per domain)", () => {
    expect(DASS21_MAPPINGS.depression.length).toBe(7);
    expect(DASS21_MAPPINGS.anxiety.length).toBe(7);
    expect(DASS21_MAPPINGS.stress.length).toBe(7);

    // Sum of lengths = 21
    const allMapped = [
      ...DASS21_MAPPINGS.depression,
      ...DASS21_MAPPINGS.anxiety,
      ...DASS21_MAPPINGS.stress
    ].sort((a, b) => a - b);

    expect(allMapped).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
    ]);
  });

  it("should double the raw sum score (sum * 2) for standard DASS-21 scaling", () => {
    // Answer 1 to all items
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 21; i++) answers[i] = 1;

    const res = calculateDASS21Scores(answers);
    // Each subscale raw sum = 7 * 1 = 7. Doubled = 14.
    expect(res.depression.rawSum).toBe(7);
    expect(res.depression.score).toBe(14);

    expect(res.anxiety.rawSum).toBe(7);
    expect(res.anxiety.score).toBe(14);

    expect(res.stress.rawSum).toBe(7);
    expect(res.stress.score).toBe(14);
  });

  it("should evaluate depression category cutoffs correctly", () => {
    expect(getDepressionCategory(0)).toBe("Normal");
    expect(getDepressionCategory(9)).toBe("Normal");
    expect(getDepressionCategory(10)).toBe("Ringan");
    expect(getDepressionCategory(13)).toBe("Ringan");
    expect(getDepressionCategory(14)).toBe("Sedang");
    expect(getDepressionCategory(20)).toBe("Sedang");
    expect(getDepressionCategory(21)).toBe("Berat");
    expect(getDepressionCategory(27)).toBe("Berat");
    expect(getDepressionCategory(28)).toBe("Sangat berat");
    expect(getDepressionCategory(42)).toBe("Sangat berat");
  });

  it("should evaluate anxiety category cutoffs correctly", () => {
    expect(getAnxietyCategory(0)).toBe("Normal");
    expect(getAnxietyCategory(7)).toBe("Normal");
    expect(getAnxietyCategory(8)).toBe("Ringan");
    expect(getAnxietyCategory(9)).toBe("Ringan");
    expect(getAnxietyCategory(10)).toBe("Sedang");
    expect(getAnxietyCategory(14)).toBe("Sedang");
    expect(getAnxietyCategory(15)).toBe("Berat");
    expect(getAnxietyCategory(19)).toBe("Berat");
    expect(getAnxietyCategory(20)).toBe("Sangat berat");
    expect(getAnxietyCategory(42)).toBe("Sangat berat");
  });

  it("should evaluate stress category cutoffs correctly", () => {
    expect(getStressCategory(0)).toBe("Normal");
    expect(getStressCategory(14)).toBe("Normal");
    expect(getStressCategory(15)).toBe("Ringan");
    expect(getStressCategory(18)).toBe("Ringan");
    expect(getStressCategory(19)).toBe("Sedang");
    expect(getStressCategory(25)).toBe("Sedang");
    expect(getStressCategory(26)).toBe("Berat");
    expect(getStressCategory(33)).toBe("Berat");
    expect(getStressCategory(34)).toBe("Sangat berat");
    expect(getStressCategory(42)).toBe("Sangat berat");
  });

  it("should handle empty data safely without throwing", () => {
    const res = calculateDASS21Scores({});
    expect(res.depression.score).toBe(0);
    expect(res.depression.category).toBe("Normal");
    expect(res.anxiety.score).toBe(0);
    expect(res.anxiety.category).toBe("Normal");
    expect(res.stress.score).toBe(0);
    expect(res.stress.category).toBe("Normal");
  });

  it("should limit personalized recommendations to maximum 3 top items", () => {
    const answers: Record<number, number> = {};
    // High stress
    DASS21_MAPPINGS.stress.forEach((id) => {
      answers[id] = 3;
    });

    const scores = calculateDASS21Scores(answers);
    const recs = getPersonalizedRecommendations(scores);

    expect(recs.length).toBeLessThanOrEqual(3);
    expect(recs.some((r) => r.id === "emergency_calm")).toBe(true);
  });

  it("should have a valid safety check item with 3 response options", () => {
    expect(SAFETY_CHECK_QUESTION.options.length).toBe(3);
    expect(SAFETY_CHECK_QUESTION.options[0].value).toBe(0);
  });
});
