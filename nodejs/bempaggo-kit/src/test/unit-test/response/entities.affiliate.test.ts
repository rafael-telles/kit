import { BempaggoAffiliateMinimalResponse } from "@/app/modules/entity/BempaggoResponse";
import { assert, assertType, describe, test } from "vitest";

describe("Affiliate entity", () => {
  describe("Response", () => {
    test("BempaggoAffiliateMinimalResponse", async () => {
      const affiliateMinimal: BempaggoAffiliateMinimalResponse = {
        id: 1,
        name: "Tony Stark",
        businessName: "Stark Industries"
      };

      assertType<BempaggoAffiliateMinimalResponse>(affiliateMinimal);
      assert.equal(3, Object.keys(affiliateMinimal).length);
      assert.equal(1, affiliateMinimal.id);
      assert.equal("Tony Stark", affiliateMinimal.name);
      assert.equal("Stark Industries", affiliateMinimal.businessName);
    });
  });
});

