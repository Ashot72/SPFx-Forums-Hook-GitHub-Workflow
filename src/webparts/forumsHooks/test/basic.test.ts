import 'jsdom-global/register';

import * as React from 'react';
import { configure, mount, ReactWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import Navigation from '../components/shared/Navigation';
import { INavigationProp } from '../components/shared/Navigation';

describe('Enzyme basics', () => {
    let reactComponent: ReactWrapper<INavigationProp, {}>;

    beforeEach(() => {
        reactComponent = mount(React.createElement(
            Navigation,
            {
                forumName: "MyForum",
                forumId: 1,
                topicName: "MyTopic"
            }
        ));
    });

    afterEach(() => {
        reactComponent.unmount();
    });

    it('should Forums Link element exists', () => {
        // define the css selector  
        let cssSelector: string = '#forumsLink';

        // find the element using css selector  
        const element = reactComponent.find(cssSelector);
        expect(element.length).toBeGreaterThan(0);
    });

    it('should be breadcrumb navigation', () => {
        // Arrange  
        // define contains/like css selector  
        let cssSelector: string = 'div';

        // Act  
        // find the element using css selector  
        const text = reactComponent.find(cssSelector).text();

        // Assert  
        expect(text).toBe("Forums ->MyForum ->MyTopic");
    });
});  