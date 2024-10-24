import { getMetadataArgsStorage } from "typeorm";

export function getEntityColumns(entities: Function[]): string[] {
	return entities.flatMap(entity => {
		return getMetadataArgsStorage()
			.columns.filter(column => column.target === entity)
			.map(column => column.propertyName);
	});
}
