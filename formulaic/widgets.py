from django.forms.widgets import MultiWidget


class GroupedChoiceWidget(MultiWidget):
    def __init__(self, widgets, attrs=None, widget_name="unknown"):
        self.widget_name = widget_name
        super(GroupedChoiceWidget, self).__init__(widgets, attrs=attrs)

    def decompress(self, value):
        if value and len(value) > 0:
            return [value]
        else:
            return []
