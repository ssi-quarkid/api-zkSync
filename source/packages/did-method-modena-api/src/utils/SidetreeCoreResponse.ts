import { ResponseStatus, ResponseModel } from "@extrimian-sidetree/common";
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export function validateSidetreeResponse(response: ResponseModel) {
    let status = response.status;
    let body = response.body;
    switch (status) {
        case ResponseStatus.BadRequest:
            throw new BadRequestException(body);
        case ResponseStatus.NotFound:
            throw new NotFoundException(body);
        case ResponseStatus.ServerError:
            throw new InternalServerErrorException(body);
        case ResponseStatus.Succeeded:
            return;
        case ResponseStatus.Deactivated:
            //do nothing
            return;
        default:
            return;
    }
}