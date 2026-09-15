import { expect, it } from "vitest";
import type { SearchAlbum, TrackListItem } from "../src/api";
import {
  filterReleases,
  hasReleaseFilters,
  libraryArtistReleases,
  releaseKind,
  releaseSubtitle,
  tidalArtistReleases,
} from "../src/artist-releases";

const minutes = (n: number) => n * 60_000;

function album(id: string, overrides: Partial<SearchAlbum>): SearchAlbum {
  return {
    id,
    title: id,
    is_compilation: false,
    track_count: 10,
    duration_ms: minutes(40),
    has_cover: true,
    source: "tidal",
    ...overrides,
  };
}

it("classifies releases by track count and runtime", () => {
  expect(releaseKind(1, minutes(3))).toBe("Single");
  expect(releaseKind(3, minutes(29))).toBe("Single");
  expect(releaseKind(3, minutes(31))).toBe("Album");
  expect(releaseKind(6, minutes(20))).toBe("EP");
  expect(releaseKind(6, minutes(30))).toBe("Album");
  expect(releaseKind(7, minutes(20))).toBe("Album");
  expect(releaseKind(2, 0)).toBe("Single");
  expect(releaseKind(0, 0)).toBe("Album");
});

it("orders TIDAL releases newest first and keeps same-year order", () => {
  const releases = tidalArtistReleases([
    album("old-album", { release_year: 2020 }),
    album("new-album", { release_year: 2024 }),
    album("undated", { release_year: undefined }),
    album("new-single", { release_year: 2024, track_count: 1, duration_ms: minutes(3), cover_url: "/c" }),
  ]);
  expect(releases.map((r) => r.id)).toEqual(["new-album", "new-single", "old-album", "undated"]);
  expect(releases[1]).toMatchObject({ kind: "Single", cover_url: "/c", release_year: 2024 });
  expect(releaseSubtitle(releases[1])).toBe("2024 · Single");
  expect(releaseSubtitle(releases[3])).toBe("Album");
});

it("filters albums from singles and EPs only when both exist", () => {
  const releases = tidalArtistReleases([
    album("lp", {}),
    album("ep", { track_count: 5, duration_ms: minutes(18) }),
    album("single", { track_count: 1, duration_ms: minutes(3) }),
  ]);
  expect(hasReleaseFilters(releases)).toBe(true);
  expect(filterReleases(releases, "albums").map((r) => r.id)).toEqual(["lp"]);
  expect(filterReleases(releases, "singles").map((r) => r.id)).toEqual(["ep", "single"]);
  expect(filterReleases(releases, "all")).toBe(releases);
  expect(hasReleaseFilters(filterReleases(releases, "albums"))).toBe(false);
});

it("groups library tracks into albums in list order", () => {
  const track = (id: string, album_id?: string, album_title?: string): TrackListItem => ({
    id,
    title: id,
    duration_ms: 1000,
    album_id,
    album_title,
    has_cover: true,
  });
  const releases = libraryArtistReleases([
    track("1", "b", "Second"),
    track("2", "a", "First"),
    track("3", "b", "Second"),
    track("4"),
  ]);
  expect(releases).toEqual([
    { id: "b", title: "Second", track_count: 2, has_cover: true, cover_url: undefined },
    { id: "a", title: "First", track_count: 1, has_cover: true, cover_url: undefined },
  ]);
  expect(hasReleaseFilters(releases)).toBe(false);
  expect(releaseSubtitle(releases[0])).toBe("2 tracks");
});
