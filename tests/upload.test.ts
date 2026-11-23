import { describe, expect, test } from "vitest";
import { detectImageType } from "../utilities/upload.ts";

// The first bytes ("magic numbers") every real PNG and JPEG file starts with
const PNG_START = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_START = [0xff, 0xd8, 0xff, 0xe0];

const file = (...bytes: number[]) => Buffer.from([...bytes, 0, 0, 0, 0, 0, 0, 0, 0]);

describe("detectImageType", () => {
	test("recognises PNG and JPEG files by their contents", () => {
		expect(detectImageType(file(...PNG_START))).toBe("image/png");
		expect(detectImageType(file(...JPEG_START))).toBe("image/jpeg");
	});

	test("rejects files that only claim to be images", () => {
		// what an HTML page renamed to "photo.png" would start with
		expect(detectImageType(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
		// a GIF, which isn't allowed
		expect(detectImageType(Buffer.from("GIF89a........"))).toBeNull();
	});

	test("rejects empty and tiny files", () => {
		expect(detectImageType(undefined)).toBeNull();
		expect(detectImageType(Buffer.alloc(0))).toBeNull();
		expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff]))).toBeNull();
	});
});
