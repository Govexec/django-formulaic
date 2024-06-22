import { belongsTo, attr } from '@ember-data/model';
import BaseFieldModel from './basefield';

export default class FieldModel extends BaseFieldModel {
    @belongsTo('textfield', { async: false, inverse: 'field' }) textfield;
    @belongsTo('choicefield', { async: false, inverse: 'field' }) choicefield;
    @belongsTo('booleanfield', { async: false, inverse: 'field' }) booleanfield;
    @belongsTo('hiddenfield', { async: false, inverse: 'field' }) hiddenfield;
    @attr('number') content_type;
}
