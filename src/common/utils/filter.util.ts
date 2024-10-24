import { NotFoundException } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { errorResponseMessage, FilterPeriod, filterRepsonseMessage } from "../constants";

export function applyFilterByStaticPeriod(query: SelectQueryBuilder<any>, period: FilterPeriod, tableAlias: string) {
	const date = new Date();
	switch (period) {
		case FilterPeriod.TODAY:
			query.andWhere(`${tableAlias}.createdAt >= :startDate`, {
				startDate: new Date(date.setHours(0, 0, 0, 0)),
			});
			break;
		case FilterPeriod.LAST_7_DAYS:
			query.andWhere(`${tableAlias}.createdAt >= :startDate`, {
				startDate: new Date(date.setDate(date.getDate() - 7)),
			});
			break;
		case FilterPeriod.LAST_4_WEEKS:
			query.andWhere(`${tableAlias}.createdAt >= :startDate`, {
				startDate: new Date(date.setDate(date.getDate() - 28)),
			});
			break;
		case FilterPeriod.LAST_12_MONTHS:
			query.andWhere(`${tableAlias}.createdAt >= :startDate`, {
				startDate: new Date(date.setMonth(date.getMonth() - 12)),
			});
			break;
		case FilterPeriod.MAX:
			break;
		default:
			throw new NotFoundException(filterRepsonseMessage.PERIOD_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
	}
}

export function applyFilterByStaticCurrentPeriod(query: SelectQueryBuilder<any>, period: FilterPeriod, tableAlias: string) {
	const date = new Date();

	switch (period) {
		case FilterPeriod.TODAY:
			query.andWhere(`DATE(${tableAlias}.createdAt) = :startDate`, {
				startDate: new Date().toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_7_DAYS:
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :startDate`, {
				startDate: new Date(date.setDate(date.getDate() - 7)).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :endDate`, {
				endDate: new Date().toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_4_WEEKS:
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :startDate`, {
				startDate: new Date(date.setMonth(date.getMonth() - 1)).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :endDate`, {
				endDate: new Date().toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_12_MONTHS:
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :startDate`, {
				startDate: new Date(date.setMonth(date.getMonth() - 12)).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :endDate`, {
				endDate: new Date().toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.MAX:
			break;
		default:
			throw new NotFoundException(filterRepsonseMessage.PERIOD_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
	}
}

export function applyFilterByStaticLastPeriod(query: SelectQueryBuilder<any>, period: FilterPeriod, tableAlias: string) {
	const date = new Date();
	const lastMonthDate = new Date(date);
	lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

	switch (period) {
		case FilterPeriod.TODAY:
			query.andWhere(`DATE(${tableAlias}.createdAt) = :startDate`, {
				startDate: new Date(lastMonthDate).toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_7_DAYS:
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :startDate`, {
				startDate: new Date(lastMonthDate.setDate(lastMonthDate.getDate() - 7)).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :endDate`, {
				endDate: new Date(lastMonthDate.setDate(lastMonthDate.getDate() + 7)).toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_4_WEEKS:
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :startDate`, {
				startDate: new Date(lastMonthDate.setMonth(lastMonthDate.getMonth())).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :endDate`, {
				endDate: new Date(lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)).toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.LAST_12_MONTHS:
			query.andWhere(`DATE(${tableAlias}.createdAt) >= :startDate`, {
				startDate: new Date(lastMonthDate.setMonth(lastMonthDate.getMonth() - 12)).toISOString().split("T")[0],
			});
			query.andWhere(`DATE(${tableAlias}.createdAt) <= :endDate`, {
				endDate: new Date(lastMonthDate.setMonth(lastMonthDate.getMonth() + 12)).toISOString().split("T")[0],
			});
			break;
		case FilterPeriod.MAX:
			break;
		default:
			throw new NotFoundException(filterRepsonseMessage.PERIOD_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
	}
}
