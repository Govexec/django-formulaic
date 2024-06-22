import DRFSerializer from './drf';
import DS from 'ember-data';

export default DRFSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        textfield: { embedded: 'always' },
        choicefield: { embedded: 'always' },
        booleanfield: { embedded: 'always' },
        hiddenfield: { embedded: 'always' }
    }
});
