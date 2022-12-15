CLASS console DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS log IMPORTING value TYPE clike.
ENDCLASS.

CLASS console IMPLEMENTATION.
  METHOD log.
    kernel_unit_runner=>mv_console = kernel_unit_runner=>mv_console && value.
  ENDMETHOD.
ENDCLASS.