CLASS zcl_simple DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS run RETURNING VALUE(res) TYPE i.
ENDCLASS.

CLASS zcl_simple IMPLEMENTATION.

  METHOD run.
    res = 3.
    console=>log( 'sdf' ).
  ENDMETHOD.

ENDCLASS.