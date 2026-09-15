import { useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  filterReleases,
  hasReleaseFilters,
  releaseSubtitle,
  type ArtistRelease,
  type ReleaseFilter,
} from "@music-library/core/artist-releases";
import { CoverArt } from "../cover-art";
import { GlassSegmentedControl } from "../glass-segmented-control";
import { HorizontalShelf } from "../horizontal-shelf";
import { Section } from "../section";
import { ShelfTile } from "../shelf-tile";
import { useTheme } from "../../theme/theme";

const TILE_SIZE = 140;
const FILTER_OPTIONS: { label: string; value: ReleaseFilter }[] = [
  { label: "All", value: "all" },
  { label: "Albums", value: "albums" },
  { label: "Singles & EPs", value: "singles" },
];

/**
 * Discography shelf, newest first. When an artist has both albums and
 * singles/EPs, a segmented control narrows the shelf to one kind.
 */
export function ArtistDiscography({
  releases,
  onOpen,
}: {
  releases: ArtistRelease[];
  onOpen: (release: ArtistRelease) => void;
}) {
  const theme = useTheme();
  const [filter, setFilter] = useState<ReleaseFilter>("all");
  const shown = filterReleases(releases, filter);
  return (
    <Section title="Discography" style={{ gap: theme.space.md }}>
      {hasReleaseFilters(releases) ? (
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <GlassSegmentedControl
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
          />
        </View>
      ) : null}
      <HorizontalShelf>
        {shown.map((release) => {
          const subtitle = releaseSubtitle(release);
          return (
            <ShelfTile
              key={release.id}
              artwork={
                <CoverArt album={release} size={TILE_SIZE} priority="low" />
              }
              title={release.title}
              subtitle={subtitle}
              width={TILE_SIZE}
              accessibilityLabel={`${release.title}, ${subtitle}`}
              onPress={() => {
                void Haptics.selectionAsync();
                onOpen(release);
              }}
            />
          );
        })}
      </HorizontalShelf>
    </Section>
  );
}
