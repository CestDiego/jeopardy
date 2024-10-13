export default {
    "scalars": [
        1,
        2,
        4,
        7,
        9
    ],
    "types": {
        "Batch": {
            "error": [
                1
            ],
            "id": [
                2
            ],
            "results": [
                1
            ],
            "status": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ID": {},
        "BatchParametersInput": {
            "model": [
                1
            ],
            "temperature": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "CreateBatchPayload": {
            "batchId": [
                2
            ],
            "__typename": [
                1
            ]
        },
        "Mutation": {
            "createBatch": [
                5,
                {
                    "batchSize": [
                        7,
                        "Int!"
                    ],
                    "fileUrl": [
                        1,
                        "String!"
                    ],
                    "parameters": [
                        3
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "Query": {
            "batch": [
                0,
                {
                    "id": [
                        2,
                        "ID!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {}
    }
}