// src/utils/generateRandomQuest.ts
import type { Quest } from "../types";
import { CONTACT_PERSON } from "../data/contactPerson";
import { LOCATIONS } from "../data/locations";
import { WEATHER } from "../data/weather";
import { OCCULT_TREASURES } from "../data/occultTreasures";
import { DUNGEON_NAME, DUNGEON_LOCATION } from "../data/dungeonName";

export function generateRandomQuest(): Quest {
  const randomFromArray = <T>(arr: T[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  return {
    dungeonName: `The ${randomFromArray(DUNGEON_NAME)} ${randomFromArray(DUNGEON_LOCATION)}`,
    weather: randomFromArray(WEATHER),
    location: randomFromArray(LOCATIONS),
    contact: randomFromArray(CONTACT_PERSON),
    occultTreasure: randomFromArray(OCCULT_TREASURES),
  };
}
