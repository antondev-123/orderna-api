import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { EndOfDayFilterDto } from "../dtos/end-of-day-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesEndOfDayService {
	constructor(private salesRepository: SalesRepository) { }

	async getEndOfDay(filterData: EndOfDayFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const endOfDay = await this.salesRepository.findEndOfDay(storeId, fromDate, toDate, offset, limit);
			if (endOfDay.data.length === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_END_OF_DAY_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			let totalTransaction = 0;
			let totalRevenue = 0;
			let totalCashPayment = 0;
			let totalCardPayment = 0;
			let totalTip = 0;
			let totalServiceCharge = 0;
			let totalAverageValue = 0;
			let totalDeliveryFee = 0;
			let totalDiscount = 0;
			let totalQuantityRefund = 0;
			let totalRefund = 0;

			endOfDay.data.map(item => {
				totalTransaction += item.totalTransaction;
				totalRevenue += item.revenue;
				totalCashPayment += item.cashPayment;
				totalCardPayment += item.cardPayment;
				totalTip += item.tip;
				totalServiceCharge += item.serviceCharge;
				totalAverageValue += item.averageValue;
				totalDeliveryFee += item.deliveryFee;
				totalDiscount += item.discount;
				totalQuantityRefund += item.quantityRefund;
				totalRefund += item.totalRefund;
			});

			return {
				revenue: endOfDay.data,
				summary: {
					totalTransaction: totalTransaction,
					revenue: totalRevenue,
					cashPayment: totalCashPayment,
					cardPayment: totalCardPayment,
					tip: totalTip,
					serviceCharge: totalServiceCharge,
					averageValue: totalAverageValue,
					deliveryFee: totalDeliveryFee,
					discount: totalDiscount,
					quantityRefund: totalQuantityRefund,
					totalRefund: totalRefund,
				},
				pagination: {
					totalPages: Math.ceil(endOfDay.count / limit),
					currentPage: parseInt(page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
