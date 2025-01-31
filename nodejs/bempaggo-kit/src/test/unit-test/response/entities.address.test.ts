import { BempaggoAddressResponse } from "@/app/modules/entity/BempaggoResponse";
import { assert, assertType, describe, test } from "vitest";

describe("Address entity", () => {
  describe("Response", () => {
    test("address", async () => {
      const address: BempaggoAddressResponse = {
        street: "Rua Jair Hamms",
        streetNumber: "38",
        lineTwo: "Sala 101",
        neighborhood: "Pedra Branca",
        city: "Palhoça",
        state: "SC",
        zipCode: "88137084",
      };
      const zipCodeRegex = /^\d{8}$/;

      assertType<BempaggoAddressResponse>(address);
      assert.equal(7, Object.keys(address).length);
      assert.equal("Rua Jair Hamms", address.street);
      assert.equal("38", address.streetNumber);
      assert.equal("Sala 101", address.lineTwo);
      assert.equal("Pedra Branca", address.neighborhood);
      assert.equal("Palhoça", address.city);
      assert.equal("SC", address.state);
      assert.equal("88137084", address.zipCode);
      assert.isTrue(zipCodeRegex.test(address.zipCode));
    });

    test("address with only required fields", async () => {
      const address: BempaggoAddressResponse = {
        street: "Rua Jair Hamms",
        streetNumber: "38",
        neighborhood: "Pedra Branca",
        city: "Palhoça",
        state: "SC",
        zipCode: "88137084",
      };
      const zipCodeRegex = /^\d{8}$/;

      assertType<BempaggoAddressResponse>(address);
      assert.equal(6, Object.keys(address).length);
      assert.equal("Rua Jair Hamms", address.street);
      assert.equal("38", address.streetNumber);
      assert.equal("Pedra Branca", address.neighborhood);
      assert.equal("Palhoça", address.city);
      assert.equal("SC", address.state);
      assert.equal("88137084", address.zipCode);
      assert.isTrue(zipCodeRegex.test(address.zipCode));
    });

    test("address with empty lineTwo", async () => {
      const address: BempaggoAddressResponse = {
        street: "Rua Jair Hamms",
        streetNumber: "38",
        lineTwo: "",
        neighborhood: "Pedra Branca",
        city: "Palhoça",
        state: "SC",
        zipCode: "88137084",
      };
      const zipCodeRegex = /^\d{8}$/;

      assertType<BempaggoAddressResponse>(address);
      assert.equal(7, Object.keys(address).length);
      assert.equal("Rua Jair Hamms", address.street);
      assert.equal("38", address.streetNumber);
      assert.equal("", address.lineTwo);
      assert.equal("Pedra Branca", address.neighborhood);
      assert.equal("Palhoça", address.city);
      assert.equal("SC", address.state);
      assert.equal("88137084", address.zipCode);
      assert.isTrue(zipCodeRegex.test(address.zipCode));
    });
  });
});


