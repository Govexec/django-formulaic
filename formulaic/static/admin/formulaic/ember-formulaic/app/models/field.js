import { belongsTo, attr } from '@ember-data/model';
import BaseFieldModel from './basefield';

export default class FieldModel extends BaseFieldModel {
    @belongsTo('textfield', { async: false }) textfield;
    @belongsTo('choicefield', { async: false }) choicefield;
    @belongsTo('booleanfield', { async: false }) booleanfield;
    @belongsTo('hiddenfield', { async: false }) hiddenfield;
    @attr('number') content_type;
}
