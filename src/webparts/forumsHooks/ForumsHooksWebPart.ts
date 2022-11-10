import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { Dialog } from '@microsoft/sp-dialog'
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import * as strings from 'ForumsHooksWebPartStrings';
import { sp } from "@pnp/sp";

import ForumsHooks from './components/ForumsHooks';
import { IForumsHooksProps } from './components/IForumsHooksProps';
import CustomListGenerator from './services/CustomListGenerator';
import { getDetailError } from './helpers/functions';

export interface IForumsHooksWebPartProps {
  context: WebPartContext;
}

export default class ForumsHooksWebPart extends BaseClientSideWebPart<IForumsHooksWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit()
      .then(_ => {
        sp.setup({ spfxContext: this.context })
        return this.generateLists()
      })
  }

  public render(): void {
    const element: React.ReactElement<IForumsHooksProps> = React.createElement(
      ForumsHooks,
      {
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
          ]
        }
      ]
    };
  }

  private generateLists = (): Promise<void> =>
    CustomListGenerator.generateLists()
      .then(() => Promise.resolve())
      .catch(error => {
        const message = getDetailError(error)
        Dialog.alert(message)
        return Promise.reject(message)
      })
}
