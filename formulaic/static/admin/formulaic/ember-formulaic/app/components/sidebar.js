import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class SidebarComponent extends Component {

  @service('field-service') fieldService;
}
