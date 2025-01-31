import { BempaggoChargeFinderV2 } from "./BempaggoChargeFinder";
import { BempaggoHttp } from "./BempaggoHttp";
import { BempaggoOrderRequest } from "./entity/BempaggoRequest";
import { BempaggoChargeResponse } from "./entity/BempaggoResponse";
import { getByUrlResponse } from "./entity/Exceptions";
import { PixOperable } from "./Transaction";

class PixApiV2 extends BempaggoChargeFinderV2 implements PixOperable {
	constructor(http: BempaggoHttp) {
		super(http);
	}

	async createPixCharge(sellerId: number, order: BempaggoOrderRequest): Promise<BempaggoChargeResponse> { //OK
		const response = await this.http.httpPost(`/v2/sellers/${sellerId}/orders/pix`, order);
		return await getByUrlResponse(response, this.http); // /v2/charges/${chargeId} //OK
	}

	async cancelPix(chargeId: number): Promise<BempaggoChargeResponse> { // OK
		const response: Response = await this.http.httpPost(`/v2/charges/${chargeId}/pix/cancel`, {});
		return await getByUrlResponse(response, this.http);// /v2/charges/${chargeId} //OK
	}

	createQuickResponseCodeUrlByChargeId(chagerId: number): URL {
		//precisa do charge id ou do order reference?, order reference esta vindo por queryparam no java, olhar isso.
		const url = new URL(`${this.http.getUrl()}/v2/charges/${chagerId}/qrcode`);
		return url;
	}

	async getQuickResponseCodeUrlByChargeId(chargeId: number): Promise<Response> {
		const response: Response = await this.http.httpGet(`${this.http.getUrl()}/v2/charges/${chargeId}/qrcode`);
		return response;
	}

}

export { PixApiV2 };

