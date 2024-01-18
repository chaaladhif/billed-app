import $ from 'jquery';
global.$ = global.jQuery = $;
setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect']