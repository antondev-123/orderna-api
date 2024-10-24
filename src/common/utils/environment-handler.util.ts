import { NotFoundException } from "@nestjs/common";
import { EnvironmentType, errorResponseMessage, generalRepsonseMessage } from "../constants";

export function getRuntimeEnvironment(): EnvironmentType {
    const production: EnvironmentType = EnvironmentType.PRODUCTION;
    const test: EnvironmentType = EnvironmentType.TEST;
    const development: EnvironmentType = EnvironmentType.DEVELOPMENT;
    const docker: EnvironmentType = EnvironmentType.DOCKER;
    switch (process.env.NODE_ENV) {
        case production:
            return production;
        case test:
            return test
        case development:
            return development;
        case docker:
            return docker;
        default:
            throw new NotFoundException(
                generalRepsonseMessage.ENVIRONMENT_NOT_FOUND.EN,
                errorResponseMessage.NOT_FOUND.EN
            );
    }
}