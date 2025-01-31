import { BempaggoSplitResponse } from "@/app/modules/entity/BempaggoResponse";
import { assert, assertType, describe, test } from "vitest";

describe("Split payment", () => {
  describe("Response", () => {
    test("Valid response", async () => {
      const splitPayment: BempaggoSplitResponse = {
        amount: 1000,
        affiliate: {
          id: 123456789,
          name: "Teste",
          businessName: "Teste"
        }
      };

      assertType<BempaggoSplitResponse>(splitPayment);
      assert.equal(2, Object.keys(splitPayment).length);
      assert.equal(1000, splitPayment.amount);
      assert.equal(123456789, splitPayment.affiliate.id);
      assert.equal("Teste", splitPayment.affiliate.name);
      assert.equal("Teste", splitPayment.affiliate.businessName);
    });
  });

});
