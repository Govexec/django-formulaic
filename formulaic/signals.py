from django.dispatch import Signal


"""
Submissions are saved in stages.  This is fired after
all steps are complete, and the Submission is complete.
"""
submission_complete = Signal()
