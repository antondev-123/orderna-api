import { GetDiscountDto } from "./get-discount.dto"
import { MetaDiscountDto } from "./meta-discount.dto"

export class GetAllDiscountDto {
    data: GetDiscountDto[];
    meta: MetaDiscountDto;
    properties: any = null;
}