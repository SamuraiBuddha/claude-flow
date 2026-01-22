export function batchInitCommand(projects: any, options?: {}): Promise<any[] | undefined>;
export function parseBatchConfig(configFile: any): Promise<any>;
export function batchInitFromConfig(configFile: any, options?: {}): Promise<any[] | undefined>;
export function validateBatchOptions(options: any): string[];
export const PROJECT_TEMPLATES: {
    'web-api': {
        name: string;
        description: string;
        extraDirs: string[];
        extraFiles: {
            'package.json': {
                name: string;
                version: string;
                type: string;
                scripts: {
                    start: string;
                    dev: string;
                    test: string;
                };
                dependencies: {
                    express: string;
                    cors: string;
                    dotenv: string;
                };
            };
            'src/index.js': string;
        };
    };
    'react-app': {
        name: string;
        description: string;
        extraDirs: string[];
        extraFiles: {
            'package.json': {
                name: string;
                version: string;
                private: boolean;
                dependencies: {
                    react: string;
                    'react-dom': string;
                    'react-scripts': string;
                    typescript: string;
                };
                scripts: {
                    start: string;
                    build: string;
                    test: string;
                };
            };
            'tsconfig.json': {
                compilerOptions: {
                    target: string;
                    lib: string[];
                    jsx: string;
                    module: string;
                    moduleResolution: string;
                    strict: boolean;
                    esModuleInterop: boolean;
                    skipLibCheck: boolean;
                    forceConsistentCasingInFileNames: boolean;
                };
            };
        };
    };
    microservice: {
        name: string;
        description: string;
        extraDirs: string[];
        extraFiles: {
            Dockerfile: string;
            'docker-compose.yml': string;
            '.dockerignore': string;
        };
    };
    'cli-tool': {
        name: string;
        description: string;
        extraDirs: string[];
        extraFiles: {
            'package.json': {
                name: string;
                version: string;
                type: string;
                bin: {
                    '{{PROJECT_NAME}}': string;
                };
                scripts: {
                    test: string;
                    lint: string;
                };
            };
            'src/cli.js': string;
        };
    };
};
export namespace ENVIRONMENT_CONFIGS {
    namespace dev {
        let name: string;
        let features: string[];
        namespace config {
            let NODE_ENV: string;
            let DEBUG: string;
            let LOG_LEVEL: string;
        }
    }
    namespace staging {
        let name_1: string;
        export { name_1 as name };
        let features_1: string[];
        export { features_1 as features };
        export namespace config_1 {
            let NODE_ENV_1: string;
            export { NODE_ENV_1 as NODE_ENV };
            let DEBUG_1: string;
            export { DEBUG_1 as DEBUG };
            let LOG_LEVEL_1: string;
            export { LOG_LEVEL_1 as LOG_LEVEL };
        }
        export { config_1 as config };
    }
    namespace prod {
        let name_2: string;
        export { name_2 as name };
        let features_2: string[];
        export { features_2 as features };
        export namespace config_2 {
            let NODE_ENV_2: string;
            export { NODE_ENV_2 as NODE_ENV };
            let DEBUG_2: string;
            export { DEBUG_2 as DEBUG };
            let LOG_LEVEL_2: string;
            export { LOG_LEVEL_2 as LOG_LEVEL };
        }
        export { config_2 as config };
    }
}
//# sourceMappingURL=batch-init.d.ts.map