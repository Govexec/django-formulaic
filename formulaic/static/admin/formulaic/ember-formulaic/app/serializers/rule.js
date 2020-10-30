import DRFSerializer from './drf';
import DS from 'ember-data';

export default DRFSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        conditions: { embedded: 'always' },
        results: { embedded: 'always' }
    }
});
