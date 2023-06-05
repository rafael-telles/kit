import { Bempaggo, BempaggoFactory } from "../Bempaggo";
import { CreditCardOperable } from "../Transaction";
import { BempaggoCardResponse, BempaggoChargeResponse, BempaggoCustomerResponse } from "../entity/BempaggoResponse";
import { BankSlipRenderingData } from "./BankSlipRenderinData";
import { BaseSdk } from './BaseSDK';
import { Layers } from "./Layers";
import { LayersCustomer, LayersCustomerPaymentMethod, LayersTransaction } from './interfaces';
import { LayersTransactionGroup } from './transactionGroup';

/**
 * @class BemPaggoSdk
 * @description Class implementing interface with BemPaggo API
 * @param {string} baseUrl - the url for BemPaggo's API
 * @param {any} auth - the auth object used on axios
 * @var axios - the Axios instance
 * @method findCustomerByDocument - Find Customer passing the document(cpf, cnpj) at BemPaggo API.
 * @method createCustomer - Create a customer at BemPaggo API.
 * @method updateCustomer - Update a customer at BemPaggo API.
 * @method findCustomerPaymentMethod - Find Customer Payment Method passing the customer_id at BemPaggo API.
 * @method createCustomerPaymentMethod - Create a customer payment method at BemPaggo API.
 * @method findTransactionsByReferenceId - Find transactions by Reference id at BemPaggo API.
 * @method getBankSlipRenderingData - Gets html for customized bank slip of a transaction
 * @method createTransaction - Create a transaction at BemPaggo API.
 * @method getOrderCharges - Get order charges at BemPaggo API.
 * @method chargeTransaction - Charge a transaction at BemPaggo API.
 * @method refundTransaction - Refund a transaction at BemPaggo API.
 * @method tokenizeCard - Tokenize a card at BemPaggo API.
 * @method shouldFindCustomerBeforeCreating - Check if should find customer before creating.
 * @method getTransactionQrCode - Get Transaction qr code.
 * @method getTransactionPaymentType - Get Transaction payment type.
 * @method cancelBankSlipTransaction - Cancel a bank slip on the BemPaggo API.
 * @static @var availableCardBrands - Get available card brands.
 * @static @var availableMethods - Get available methods.
 */
class BemPaggoSdk extends BaseSdk<LayersCustomer, LayersTransaction, LayersCustomerPaymentMethod, never> {
	private bempaggo: Bempaggo | null = null;
	constructor(baseURL: string, auth: string) {
		super(baseURL, 'bempaggo', auth);
		const factory: BempaggoFactory = new BempaggoFactory();
		this.bempaggo = factory.createByUrl(baseURL, auth);
	}

	/**
	 *  Find Customer passing the document(cpf, cnpj) at BemPaggo API.
	 * @param {string} document - The document number.
	 * @return {Promise<BemPaggoCustomer>}
	 */
	async findCustomerByDocument(document: string): Promise<LayersCustomer> {
		const customer: BempaggoCustomerResponse = await this.bempaggo!.findCustomerByDocument(document);
		return Layers.from(customer);
	}

	/**
	 *  Create a customer at BemPaggo API.
	 * @param {BemPaggoCustomer} customer - The customer object.
	 * @return {Promise<BemPaggoCustomer>}
	 */
	async createCustomer(customer: LayersCustomer): Promise<LayersCustomer> {
		const bempaggoCustomer: BempaggoCustomerResponse = await this.bempaggo!.createCustomer(Layers.toCustomer(customer));
		return Layers.from(bempaggoCustomer);
	}

	/**
	 *  Update a customer at BemPaggo API.
	 * @param {BemPaggoCustomer} customer - The External customer object.
	 * @return {Promise<BemPaggoCustomer>}
	 */
	async updateCustomer(customer: LayersCustomer): Promise<LayersCustomer> {
		const request = Layers.toCustomer(customer);
		const bempaggoCustomer: BempaggoCustomerResponse = await this.bempaggo!.updateCustomer(request.document, request);
		return Layers.from(bempaggoCustomer);
	}

	/**
	 * Gets a customer's payment methods
	 * @param customerId // TODO cpf/cnpj? 06219385993 ok 
	 * @returns BemPaggoPaymentMethod
	 */
	async findCustomerPaymentMethod(customerId: string): Promise<LayersCustomerPaymentMethod> {
		const bempaggoCustomer: BempaggoCardResponse = await this.bempaggo!.findCustomerPaymentMethod(customerId);
		return Layers.fromCards(bempaggoCustomer);
	}

	/**
	 *  Add a new payment method to a customer at BemPaggo API.
	 * @param {string} customerId
	 * @param {BemPaggoPaymentMethod} paymentMethod -
	 * @returns {Promise<any>}
	 */
	async createCustomerPaymentMethod(
		customerId: string,  // cpf/cnpj?
		paymentMethod: LayersCustomerPaymentMethod
	): Promise<LayersCustomerPaymentMethod> {
		const bempaggoCard: BempaggoCardResponse = await this.bempaggo!.createCustomerPaymentMethod(customerId, Layers.toCard(paymentMethod));
		return Layers.fromCards(bempaggoCard);
	}

	/**
	 * Find a transaction by a reference id we send to bem paggo on creation
	 * @param {string} referenceId Id sent by our backend on creation // orderReference
	 * @returns { Promise<LayersTransaction> }
	 */
	async findTransactionsByReferenceId(referenceId: string): Promise<LayersTransaction> {
		const creditCardService: CreditCardOperable = this.bempaggo!.getChargeService().getCreditCardServiceable();
		const response: BempaggoChargeResponse[] = await creditCardService.findChargesByOrderReferenceId(referenceId);
		return Layers.fromCharge(response[0]);
	}

	/**
	 * Find a charge by id received from bempaggo on creation
	 * @param {number} id get from bempaggo on creation
	 * @returns { Promise<LayersTransaction> }
	 */
	async findChargeById(id: number): Promise<LayersTransaction> {
		const creditCardService: CreditCardOperable = this.bempaggo!.getChargeService().getCreditCardServiceable();
		const response: BempaggoChargeResponse = await creditCardService.findChargeById(id);
		return Layers.fromCharge(response);
	}


	/**
	 * Gets html for customized bank slip of a transaction
	 * @param {string} transactionId
	 * @returns { Promise<BankSlipRenderingData> }
	 */
	async getBankSlipRenderingData(transactionId: string): Promise<BankSlipRenderingData> {
		throw new Error(`not implemented ${transactionId}`)
	}


	/**
	 *
	 * @param {LayersTransactionGroup} transactionGroup
	 * @returns { LayersTransaction }
	 */
	async createTransaction(transactionGroup: LayersTransactionGroup): Promise<LayersTransaction> {
		const sellerId: number = transactionGroup.sourceId as number;
		if (this.isOnlyCreditCard(transactionGroup.paymentMethods)) {
			const creditCardService: CreditCardOperable = this.bempaggo!.getChargeService().getCreditCardServiceable();
			const response: BempaggoChargeResponse = await creditCardService.createCharge(sellerId, Layers.toOrder(transactionGroup));
			return Layers.fromCharge(response);
		}
		throw new Error("not implemented yet");
	}
	isOnlyCreditCard(paymentMethods: { method: "credit_card" }[]): boolean {
		if (paymentMethods.filter(menthod => menthod.method != "credit_card").length > 0) {
			throw new Error('Only credit card implemented')
		}
		return true;
	}

	/**
	 * Bem paggo does not implement charges. So this method should just throw
	 */
	async getOrderCharges(_: never): Promise<never> {
		throw new Error('Bem paggo does not implement charges')
	}

	/**
	 * Captures the transaction given an id
	 * @param { string } transactionId //TODO charge.id
	 * @returns { LayersTransaction }
	 */
	async chargeTransaction(transactionId: string): Promise<LayersTransaction> {
		const creditCardService: CreditCardOperable = this.bempaggo!.getChargeService().getCreditCardServiceable();
		const response: BempaggoChargeResponse = await creditCardService.captureCharge(Number(transactionId));
		return Layers.fromCharge(response);
	}

	/**
	 * Refunds a given transaction
	 * @param { string } transactionId  // TODO charge.id ?
	 * @returns { Promise<LayersTransaction> }
	 */
	async refundTransaction(transactionId: string): Promise<LayersTransaction> {
		const creditCardService: CreditCardOperable = this.bempaggo!.getChargeService().getCreditCardServiceable();
		const response: BempaggoChargeResponse = await creditCardService.refundCharge(Number(transactionId));
		return Layers.fromCharge(response);
	}
	/**
	 * Tokenize the card data.
	 * @param card - The card data.
	 * @param hash - The card hash.
	 * @returns {Promise<any>}
	 */
	async tokenizeCard(card: any, hash: string): Promise<any> {
		const typedCard: LayersCustomerPaymentMethod = card as LayersCustomerPaymentMethod;
		const cardResponse: BempaggoCardResponse | undefined = await this.bempaggo?.tokenizeCard(Layers.toCard(typedCard), hash)
		return cardResponse?.token;
	}

	/**
	 * Returns wether we should query for a customer before updating it
	 */
	shouldFindCustomerBeforeCreating() {
		// You may to send the customer (address) in order, she will updated or created. 
		// You may to use the document (cpf or cnpj) as customer id. The document shoud be only number, but it needs to keep left zeros (01 <> 1)     
		throw new Error('not implemented')
	}

	/**
	 * Returns an url to a transaction's Qr code, if it is a pix
	 * @param {LayersTransaction} transaction
	 * @returns
	 */
	getExternalQrCode(transaction: LayersTransaction): string {
		throw new Error('not implemented')
	}

	/**
	 * Returns a string describing the payment type
	 * @throws if no payment type is found
	 * @param {LayersTransaction} transaction
	 * @returns { 'bank_slip' | 'pix' | 'credit_card'}
	 */
	getExternalPaymentType(transaction: LayersTransaction): 'bank_slip' | 'pix' | 'credit_card' | undefined {
		throw new Error('not implemented')
	}

	/**
	 * Cancels a bank slip transaction, if it can be cancelled
	 * @param {LayersTransaction} transaction
	 */
	async cancelBankSlipTransaction(transaction: LayersTransaction): Promise<void> {
		throw new Error('not implemented')
	}

	/**
	 * Just an example
	 * We need this static attribute, to map BemPaggo's name to our names
	 *  */
	static ExternalPaymentType = {
		//    boleto: 'bank_slip',
		//    pix: 'pix',
		credit_card: 'credit_card',
	} as const

	/**
	 * Another example
	 * We need to know all available card brands on BemPaggo
	 */
	static availableCardBrands = [
		'mastercard',
		'visa',
		'elo',
		'american-express',
		'diners-club',
		'jcb',
		'hipercard',
	] as const
}

export type BemPaggoCardBrands = typeof BemPaggoSdk.availableCardBrands[number]

export default BemPaggoSdk
